import OBR, { Item } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, DEFAULT_PC_STATS, DEFAULT_NPC_STATS } from "./constants";
import { DaggerheartStats } from "./types";

/**
 * Metadata key for storing the stable token ID
 */
const TOKEN_ID_KEY = `${EXTENSION_ID}/token-id`;

/**
 * Generate a stable UUID for token identification
 */
function generateTokenId(): string {
  return crypto.randomUUID();
}

/**
 * Get the legacy key format (for migration)
 * Format: "{name}::{imageHash}"
 */
function getLegacyTokenKey(item: Item): string {
  const name = item.name || (item as any).text?.plainText || "unnamed";
  const imageUrl = (item as any).image?.url || "";
  const urlParts = imageUrl.split("/");
  const filename = urlParts[urlParts.length - 1] || "";
  const imageHash = filename.substring(0, 12) || "noimg";
  const safeName = name.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
  return `${safeName}::${imageHash}`;
}

/**
 * Get or create a stable token ID that persists across name changes and scenes.
 *
 * This function:
 * 1. Checks if the item already has a UUID in its metadata
 * 2. If not, attempts migration from legacy name-based keys
 * 3. If no legacy data found, generates a new UUID
 *
 * The UUID is stored in item metadata and survives both name changes and scene changes.
 */
export async function getOrCreateTokenId(item: Item): Promise<string> {
  // Check if item already has a UUID
  const existingId = item.metadata?.[TOKEN_ID_KEY] as string | undefined;
  if (existingId) {
    return existingId;
  }

  // No UUID found - check for legacy data to migrate
  const legacyKey = getLegacyTokenKey(item);
  const allData = await loadAllTokenData();
  const legacyStats = allData[legacyKey];

  // Generate new UUID
  const newId = generateTokenId();

  // Store UUID in item metadata
  await OBR.scene.items.updateItems([item.id], (items) => {
    for (const updatedItem of items) {
      updatedItem.metadata[TOKEN_ID_KEY] = newId;
    }
  });

  // If we found legacy data, migrate it to the new UUID key
  if (legacyStats) {
    console.log(`[DH] Migrating legacy data from ${legacyKey} to ${newId}`);

    // Copy to new key
    allData[newId] = legacyStats;

    // Remove old key
    delete allData[legacyKey];

    // Save updated metadata
    await OBR.room.setMetadata({
      [getMetadataKey()]: allData,
    });
  }

  return newId;
}

/**
 * Get the metadata key used for room storage
 */
function getMetadataKey(): string {
  return `${EXTENSION_ID}/tokens`;
}

/**
 * Load all token data from room metadata
 */
export async function loadAllTokenData(): Promise<
  Record<string, DaggerheartStats>
> {
  const metadata = await OBR.room.getMetadata();
  return (
    (metadata[getMetadataKey()] as Record<string, DaggerheartStats>) || {}
  );
}

/**
 * Load stats for a specific token
 */
export async function loadTokenStats(
  item: Item
): Promise<DaggerheartStats | null> {
  const tokenId = await getOrCreateTokenId(item);
  const allData = await loadAllTokenData();
  const stats = allData[tokenId];

  if (!stats) return null;

  // Normalize: ensure isPC is a boolean (fix legacy/corrupted data)
  if (typeof stats.isPC !== "boolean") {
    stats.isPC = (stats.hope?.max ?? 0) > 0;
    console.log(`[DH] Normalized isPC=${stats.isPC} for ${tokenId}`);
  }

  return stats;
}

/**
 * Save stats for a specific token
 */
export async function saveTokenStats(
  item: Item,
  stats: DaggerheartStats
): Promise<void> {
  const tokenId = await getOrCreateTokenId(item);
  const allData = await loadAllTokenData();

  await OBR.room.setMetadata({
    [getMetadataKey()]: {
      ...allData,
      [tokenId]: stats,
    },
  });

  console.log(`[DH] Saved stats for ${item.name} (${tokenId}):`, stats);
}

/**
 * Remove stats for a specific token
 */
export async function removeTokenStats(item: Item): Promise<void> {
  const tokenId = await getOrCreateTokenId(item);
  const allData = await loadAllTokenData();

  delete allData[tokenId];

  await OBR.room.setMetadata({
    [getMetadataKey()]: allData,
  });

  console.log(`[DH] Removed stats for ${item.name} (${tokenId})`);
}

/**
 * Check if a token has stats stored
 */
export async function hasTokenStats(item: Item): Promise<boolean> {
  const stats = await loadTokenStats(item);
  return stats !== null;
}

/**
 * Get stats for a token, creating defaults if not found
 */
export async function getOrCreateStats(
  item: Item,
  isPC: boolean = true
): Promise<DaggerheartStats> {
  const existing = await loadTokenStats(item);
  if (existing) {
    return existing;
  }

  const defaults = isPC ? { ...DEFAULT_PC_STATS } : { ...DEFAULT_NPC_STATS };
  await saveTokenStats(item, defaults);
  return defaults;
}

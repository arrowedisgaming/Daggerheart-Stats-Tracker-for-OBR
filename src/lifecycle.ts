import OBR, { Item, isImage } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";
import { DaggerheartStats } from "./types";
import { buildAllBars } from "./rendering";
import { loadTokenStats } from "./persistence";
import { isItemTracked } from "./itemMetadata";
import { loadSettings, isGM } from "./settings";

// Item types created by this extension (for cleanup)
const EXTENSION_ITEM_TYPES = ["segment", "stat-badge", "stat-badge-text"];

/**
 * Remove all stat display items attached to a specific token
 * Only GM can manage bar shapes
 */
export async function clearBarsForToken(tokenId: string): Promise<void> {
  // Only GM manages bar shapes
  const gmMode = await isGM();
  if (!gmMode) {
    return;
  }

  const sceneItems = await OBR.scene.items.getItems();

  const itemIds = sceneItems
    .filter((item) => {
      const meta = item.metadata || {};
      const itemType = meta[`${EXTENSION_ID}/type`] as string;
      return (
        EXTENSION_ITEM_TYPES.includes(itemType) &&
        meta[`${EXTENSION_ID}/tokenId`] === tokenId
      );
    })
    .map((item) => item.id);

  if (itemIds.length > 0) {
    await OBR.scene.items.deleteItems(itemIds);
    console.log(`[DH] Cleared ${itemIds.length} stat items for ${tokenId}`);
  }
}

/**
 * Render bars for a token (clears existing bars first)
 * Only GM can manage bar shapes
 */
export async function renderBarsForToken(
  token: Item,
  stats: DaggerheartStats
): Promise<void> {
  // Only GM manages bar shapes
  const gmMode = await isGM();
  if (!gmMode) {
    return;
  }

  // Only render for image items (CHARACTER tokens)
  if (!isImage(token)) {
    console.warn(`[DH] Cannot render bars for non-image item: ${token.name}`);
    return;
  }

  // Clear any existing bars
  await clearBarsForToken(token.id);

  // Get scene DPI for proper positioning
  const sceneDpi = await OBR.scene.grid.getDpi();

  // Build new segments
  const segments = buildAllBars(token, stats, sceneDpi);

  // Add to scene as shared items (visible to all players)
  if (segments.length > 0) {
    await OBR.scene.items.addItems(segments);
    console.log(`[DH] Rendered ${segments.length} bar segments for ${token.name}`);
  }
}

/**
 * Clear all stat display items created by this extension
 * Only GM can manage (create/delete) bar shapes to prevent race conditions
 */
export async function clearAllBars(): Promise<void> {
  // Only GM manages bar shapes
  const gmMode = await isGM();
  if (!gmMode) {
    console.log("[DH] Skipping clearAllBars - not GM");
    return;
  }

  const sceneItems = await OBR.scene.items.getItems();

  const itemIds = sceneItems
    .filter((item) => {
      const meta = item.metadata || {};
      const itemType = meta[`${EXTENSION_ID}/type`] as string;
      return EXTENSION_ITEM_TYPES.includes(itemType);
    })
    .map((item) => item.id);

  if (itemIds.length > 0) {
    await OBR.scene.items.deleteItems(itemIds);
    console.log(`[DH] Cleared all stat items (${itemIds.length} items)`);
  }
}

/**
 * Refresh bars for all tracked tokens in the current scene
 * Only GM can manage (create/delete) bar shapes to prevent race conditions
 * between multiple clients fighting over the same items.
 */
export async function refreshAllBars(): Promise<void> {
  // Only GM manages bar shapes - prevents race conditions where
  // GM and player clients keep recreating/deleting each other's shapes
  const gmMode = await isGM();
  if (!gmMode) {
    console.log("[DH] Skipping refreshAllBars - not GM");
    return;
  }

  console.log("[DH] Refreshing all bars");

  // First clear everything
  await clearAllBars();

  // Check visibility settings
  const settings = await loadSettings();
  const hideNpc = settings.hideNpcStatsFromPlayers;

  // Get all character tokens
  const items = await OBR.scene.items.getItems(
    (item) => item.layer === "CHARACTER"
  );

  // Render bars for tracked items
  for (const item of items) {
    if (isItemTracked(item)) {
      const stats = await loadTokenStats(item);
      if (stats) {
        // Skip NPC bars when hiding is enabled
        if (hideNpc && !stats.isPC) {
          console.log(`[DH] Hiding NPC bars for ${item.name}`);
          continue;
        }
        await renderBarsForToken(item, stats);
      } else {
        console.warn(`[DH] Token ${item.name} is marked as tracked but has no stats`);
      }
    }
  }
}

/**
 * Handle a single token being added or needing refresh
 * Only GM can manage bar shapes
 */
export async function refreshBarsForToken(token: Item): Promise<void> {
  // Only GM manages bar shapes
  const gmMode = await isGM();
  if (!gmMode) {
    return;
  }

  if (!isItemTracked(token)) {
    // Not tracked, ensure no bars exist
    await clearBarsForToken(token.id);
    return;
  }

  const stats = await loadTokenStats(token);
  if (stats) {
    await renderBarsForToken(token, stats);
  }
}

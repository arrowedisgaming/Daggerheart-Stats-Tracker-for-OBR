import OBR, { Item, isImage, Image } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, ThemeMode } from "./constants";
import { DaggerheartStats } from "./types";
import { buildAllBars } from "./rendering";
import { loadTokenStats } from "./persistence";
import { isItemTracked } from "./itemMetadata";
import { loadSettings } from "./settings";

/**
 * Current OBR theme mode. Updated by listeners.ts via OBR.theme.onChange
 * so badges adapt to light/dark UI without going through the room-metadata
 * round trip.
 */
let currentThemeMode: ThemeMode = "DARK";

export function setThemeMode(mode: ThemeMode): void {
  if (currentThemeMode === mode) return;
  currentThemeMode = mode;
  // Drop the cache so every tracked token re-renders with new colors.
  renderCache.clear();
}

// Item types created by this extension (for cleanup)
const EXTENSION_ITEM_TYPES = ["segment", "stat-badge", "stat-badge-glyph", "stat-badge-text", "stat-badge-slash", "stat-badge-glyph-path"];

/**
 * Cache of last-rendered state per token, keyed by OBR item ID.
 * Includes both stats and token geometry so scale/position changes trigger re-renders.
 */
const renderCache = new Map<string, string>();

/**
 * Serialize all state that affects badge rendering into a comparable string.
 * Includes stats AND token geometry (scale, bounds) so resizing triggers re-render.
 */
function serializeRenderState(stats: DaggerheartStats, token: Image): string {
  return JSON.stringify({
    hp: stats.hp.current,
    hpMax: stats.hp.max,
    stress: stats.stress.current,
    stressMax: stats.stress.max,
    armor: stats.armor.current,
    armorMax: stats.armor.max,
    hope: stats.hope.current,
    hopeMax: stats.hope.max,
    isPC: stats.isPC,
    scaleX: token.scale.x,
    scaleY: token.scale.y,
  });
}

/**
 * Invalidate the render cache for a specific token.
 * Called by listeners when token geometry changes.
 */
export function invalidateTokenCache(tokenId: string): void {
  renderCache.delete(tokenId);
}

/**
 * Remove all stat display items attached to a specific token.
 * Operates on local items so each client cleans up its own badges.
 */
export async function clearBarsForToken(tokenId: string): Promise<void> {
  const localItems = await OBR.scene.local.getItems();

  const itemIds = localItems
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
    await OBR.scene.local.deleteItems(itemIds);
    console.log(`[DH] Cleared ${itemIds.length} stat items for ${tokenId}`);
  }

  renderCache.delete(tokenId);
}

/**
 * Render bars for a token (clears existing bars first).
 * Badges are added as local items so each client renders independently.
 */
export async function renderBarsForToken(
  token: Item,
  stats: DaggerheartStats
): Promise<void> {
  if (!isImage(token)) {
    console.warn(`[DH] Cannot render bars for non-image item: ${token.name}`);
    return;
  }

  await clearBarsForToken(token.id);

  const sceneDpi = await OBR.scene.grid.getDpi();
  const segments = buildAllBars(token, stats, sceneDpi, currentThemeMode);

  // Add in four passes for correct z-ordering:
  // 1. Circles (background), 2. Glyph paths (heart above circle), 3. Text, 4. Slash overlays
  // OBR renders items from later addItems() calls above earlier ones.
  const circles = segments.filter(
    (item) => item.metadata[`${EXTENSION_ID}/type`] === "stat-badge"
  );
  const glyphPaths = segments.filter(
    (item) => item.metadata[`${EXTENSION_ID}/type`] === "stat-badge-glyph-path"
  );
  const texts = segments.filter(
    (item) => {
      const t = item.metadata[`${EXTENSION_ID}/type`];
      return t === "stat-badge-text" || t === "stat-badge-glyph";
    }
  );
  const slashes = segments.filter(
    (item) => item.metadata[`${EXTENSION_ID}/type`] === "stat-badge-slash"
  );
  if (circles.length > 0) await OBR.scene.local.addItems(circles);
  if (glyphPaths.length > 0) await OBR.scene.local.addItems(glyphPaths);
  if (texts.length > 0) await OBR.scene.local.addItems(texts);
  if (slashes.length > 0) await OBR.scene.local.addItems(slashes);
  if (segments.length > 0) {
    console.log(`[DH] Rendered ${segments.length} bar segments for ${token.name}`);
  }

  renderCache.set(token.id, serializeRenderState(stats, token));
}

/**
 * Clear all stat display items created by this extension on this client.
 */
export async function clearAllBars(): Promise<void> {
  const localItems = await OBR.scene.local.getItems();

  const itemIds = localItems
    .filter((item) => {
      const meta = item.metadata || {};
      const itemType = meta[`${EXTENSION_ID}/type`] as string;
      return EXTENSION_ITEM_TYPES.includes(itemType);
    })
    .map((item) => item.id);

  if (itemIds.length > 0) {
    await OBR.scene.local.deleteItems(itemIds);
    console.log(`[DH] Cleared all stat items (${itemIds.length} items)`);
  }

  renderCache.clear();
}

/**
 * Refresh bars for all tracked tokens, only re-rendering tokens whose stats changed.
 * Compares current stats against cached values to avoid unnecessary delete/recreate cycles.
 * Runs on every client; badges are local-only, so there are no cross-client races.
 */
export async function refreshAllBars(): Promise<void> {
  console.log("[DH] Refreshing all bars (selective)");

  // Check visibility settings
  const settings = await loadSettings();
  const hideNpc = settings.hideNpcStatsFromPlayers;

  // Get all character tokens
  const items = await OBR.scene.items.getItems(
    (item) => item.layer === "CHARACTER"
  );

  // Track which token IDs are still present/tracked
  const activeTokenIds = new Set<string>();

  // Render bars for tracked items, but only if stats changed
  for (const item of items) {
    if (isItemTracked(item)) {
      const stats = await loadTokenStats(item);
      if (stats) {
        activeTokenIds.add(item.id);

        // Skip NPC bars when hiding is enabled
        if (hideNpc && !stats.isPC) {
          // If we previously rendered bars for this NPC, clear them
          if (renderCache.has(item.id)) {
            await clearBarsForToken(item.id);
          }
          console.log(`[DH] Hiding NPC bars for ${item.name}`);
          continue;
        }

        // Check cache — skip if stats and geometry haven't changed
        if (isImage(item)) {
          const serialized = serializeRenderState(stats, item);
          if (renderCache.get(item.id) === serialized) {
            continue; // No change, skip re-render
          }
        }

        await renderBarsForToken(item, stats);
      } else {
        console.warn(`[DH] Token ${item.name} is marked as tracked but has no stats`);
      }
    }
  }

  // Clear bars for tokens that were removed or untracked
  for (const cachedTokenId of renderCache.keys()) {
    if (!activeTokenIds.has(cachedTokenId)) {
      await clearBarsForToken(cachedTokenId);
    }
  }
}

/**
 * Handle a single token being added or needing refresh.
 */
export async function refreshBarsForToken(token: Item): Promise<void> {
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

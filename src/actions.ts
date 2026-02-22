import { Item } from "@owlbear-rodeo/sdk";
import { DaggerheartStats } from "./types";
import { saveTokenStats, removeTokenStats } from "./persistence";
import { markItemAsTracked, unmarkItemAsTracked } from "./itemMetadata";
import { renderBarsForToken, clearBarsForToken } from "./lifecycle";
import { loadSettings } from "./settings";

/**
 * Check if bars should be rendered for given stats based on current settings
 */
async function shouldRenderBars(stats: DaggerheartStats): Promise<boolean> {
  const settings = await loadSettings();
  // Don't render NPC bars when hiding is enabled
  if (settings.hideNpcStatsFromPlayers && !stats.isPC) {
    return false;
  }
  return true;
}

/**
 * Initialize tracking for a token
 * This is called when adding Daggerheart stats to a new token
 */
export async function initializeTracking(
  item: Item,
  stats: DaggerheartStats
): Promise<void> {
  console.log(`[DH] Initializing tracking for token:`, item.name);

  // Save to room metadata
  await saveTokenStats(item, stats);

  // Mark item as tracked
  await markItemAsTracked(item.id);

  // Render visual bars (if not hidden by settings)
  if (await shouldRenderBars(stats)) {
    await renderBarsForToken(item, stats);
  } else {
    console.log(`[DH] Skipping bar render for ${item.name} (hidden by settings)`);
  }
}

/**
 * Update stats for a tracked token
 * This is called when editing stats via the UI
 */
export async function updateStats(
  item: Item,
  stats: DaggerheartStats
): Promise<void> {
  console.log(`[DH] Updating stats for token:`, item.name);

  // Save updated stats
  await saveTokenStats(item, stats);

  // Re-render bars with new values (if not hidden by settings)
  if (await shouldRenderBars(stats)) {
    await renderBarsForToken(item, stats);
  } else {
    // Clear any existing bars since they should be hidden
    await clearBarsForToken(item.id);
    console.log(`[DH] Cleared bars for ${item.name} (hidden by settings)`);
  }
}

/**
 * Remove tracking from a token
 * @param item - The token to remove tracking from
 * @param preserveData - If true, keeps room data for potential re-add
 */
export async function removeTracking(
  item: Item,
  preserveData: boolean = false
): Promise<void> {
  console.log(`[DH] Removing tracking for token:`, item.name);

  // Clear visual bars
  await clearBarsForToken(item.id);

  // Remove tracking mark
  await unmarkItemAsTracked(item.id);

  // Optionally remove room data
  if (!preserveData) {
    await removeTokenStats(item);
  }
}

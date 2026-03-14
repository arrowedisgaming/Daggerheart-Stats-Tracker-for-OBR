import { Item } from "@owlbear-rodeo/sdk";
import { DaggerheartStats } from "./types";
import { saveTokenStats, removeTokenStats } from "./persistence";
import { markItemAsTracked, unmarkItemAsTracked } from "./itemMetadata";
import { clearBarsForToken } from "./lifecycle";

/**
 * Initialize tracking for a token
 * This is called when adding Daggerheart stats to a new token
 */
export async function initializeTracking(
  item: Item,
  stats: DaggerheartStats
): Promise<void> {
  console.log(`[DH] Initializing tracking for token:`, item.name);

  // Mark item as tracked
  await markItemAsTracked(item.id);

  // Save to room metadata — the metadata change listener will handle rendering
  await saveTokenStats(item, stats);
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

  // Save updated stats — the metadata change listener will handle rendering
  await saveTokenStats(item, stats);
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

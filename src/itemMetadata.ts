import OBR, { Item } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";

const TRACKED_KEY = `${EXTENSION_ID}/tracked`;
export const IS_PC_KEY = `${EXTENSION_ID}/isPC`;

/**
 * Mirror the PC/NPC flag onto the item itself so the OBR context-menu
 * filter can pick it up (filters can only inspect item metadata, not
 * room metadata where the full stats live).
 */
export async function setItemPCFlag(itemId: string, isPC: boolean): Promise<void> {
  await OBR.scene.items.updateItems([itemId], (items) => {
    for (const item of items) {
      item.metadata[IS_PC_KEY] = isPC;
    }
  });
}

/**
 * Mark an item as being tracked by this extension
 * This allows quick filtering of tracked tokens in the scene
 */
export async function markItemAsTracked(itemId: string): Promise<void> {
  await OBR.scene.items.updateItems([itemId], (items) => {
    for (const item of items) {
      item.metadata[TRACKED_KEY] = true;
    }
  });
}

/**
 * Remove tracking mark from an item
 */
export async function unmarkItemAsTracked(itemId: string): Promise<void> {
  await OBR.scene.items.updateItems([itemId], (items) => {
    for (const item of items) {
      delete item.metadata[TRACKED_KEY];
    }
  });
}

/**
 * Check if an item is marked as tracked
 */
export function isItemTracked(item: Item): boolean {
  return item.metadata?.[TRACKED_KEY] === true;
}

/**
 * Get all tracked items in the current scene
 */
export async function getTrackedItems(): Promise<Item[]> {
  return OBR.scene.items.getItems((item) => {
    return item.layer === "CHARACTER" && isItemTracked(item);
  });
}

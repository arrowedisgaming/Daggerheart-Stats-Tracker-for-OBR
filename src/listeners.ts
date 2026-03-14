import OBR, { isImage, Image } from "@owlbear-rodeo/sdk";
import { refreshAllBars, clearAllBars, invalidateTokenCache } from "./lifecycle";
import { isItemTracked } from "./itemMetadata";

let refreshTimeout: number | null = null;
let isRefreshing = false;

/**
 * Cache of token scales, used to detect resize and trigger re-render.
 * Keyed by OBR item ID → "scaleX,scaleY"
 */
const scaleCache = new Map<string, string>();

/**
 * Set up listeners for scene changes
 * These handle when scenes load/unload and when items change
 */
export function setupSceneListeners(): void {
  console.log("[DH] Setting up scene listeners");

  // When scene ready state changes
  OBR.scene.onReadyChange(async (isReady) => {
    if (isReady) {
      console.log("[DH] Scene is ready, rendering all bars");
      // Scene just loaded, render all bars
      await refreshAllBars();
    } else {
      console.log("[DH] Scene closing, clearing all bars");
      // Scene closing, clear local items
      await clearAllBars();
    }
  });

  // Listen for room metadata changes (where stats are stored)
  // This is more reliable than listening to all item changes
  OBR.room.onMetadataChange(async () => {
    if (isRefreshing) {
      console.log("[DH] Refresh already in progress, skipping");
      return;
    }

    // Debounce rapid changes
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    refreshTimeout = window.setTimeout(async () => {
      const isReady = await OBR.scene.isReady();
      if (isReady) {
        console.log("[DH] Room metadata changed, refreshing bars");
        isRefreshing = true;
        try {
          await refreshAllBars();
        } finally {
          isRefreshing = false;
        }
      }
      refreshTimeout = null;
    }, 300);
  });

  // Listen for item changes (scale/resize) on CHARACTER layer
  OBR.scene.items.onChange(async (items) => {
    // Check tracked tokens for scale changes
    let needsRefresh = false;
    for (const item of items) {
      if (item.layer !== "CHARACTER" || !isImage(item) || !isItemTracked(item)) {
        continue;
      }

      const scaleKey = `${(item as Image).scale.x},${(item as Image).scale.y}`;
      const cached = scaleCache.get(item.id);

      if (cached !== undefined && cached !== scaleKey) {
        // Scale changed — invalidate render cache so it re-renders
        invalidateTokenCache(item.id);
        needsRefresh = true;
      }
      scaleCache.set(item.id, scaleKey);
    }

    if (needsRefresh && !isRefreshing) {
      console.log("[DH] Token scale changed, refreshing bars");
      isRefreshing = true;
      try {
        await refreshAllBars();
      } finally {
        isRefreshing = false;
      }
    }
  });
}

/**
 * Initial setup - call after OBR.onReady
 */
export async function initializeRendering(): Promise<void> {
  console.log("[DH] Initializing rendering system");

  // Check if scene is already ready
  const isReady = await OBR.scene.isReady();
  if (isReady) {
    await refreshAllBars();
  }

  // Set up ongoing listeners
  setupSceneListeners();
}

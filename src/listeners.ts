import OBR from "@owlbear-rodeo/sdk";
import { refreshAllBars, clearAllBars } from "./lifecycle";

let refreshTimeout: number | null = null;
let isRefreshing = false;

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

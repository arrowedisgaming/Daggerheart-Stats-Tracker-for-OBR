import OBR, { isImage, Image } from "@owlbear-rodeo/sdk";
import { refreshAllBars, clearAllBars, invalidateTokenCache, setThemeMode } from "./lifecycle";
import { isItemTracked } from "./itemMetadata";
import { getTokenIdFromItem, removeTokenStatsById } from "./persistence";
import { isGM } from "./settings";

let refreshTimeout: number | null = null;
let isRefreshing = false;

/**
 * Cache of token scales, used to detect resize and trigger re-render.
 * Keyed by OBR item ID → "scaleX,scaleY"
 */
const scaleCache = new Map<string, string>();

/**
 * Track tracked tokens we've seen in the current scene so we can detect
 * deletions and clean up their room-metadata entries.
 * Map of OBR item id → stable token UUID.
 */
const knownTrackedItems = new Map<string, string>();

/**
 * Set up listeners for scene changes
 * These handle when scenes load/unload and when items change
 */
export function setupSceneListeners(): void {
  console.log("[DH] Setting up scene listeners");

  // Sync badge palette to OBR's UI theme
  OBR.theme.onChange(async (theme) => {
    setThemeMode(theme.mode);
    if (await OBR.scene.isReady()) {
      await refreshAllBars();
    }
  });

  // When scene ready state changes
  OBR.scene.onReadyChange(async (isReady) => {
    if (isReady) {
      console.log("[DH] Scene is ready, rendering all bars");
      await refreshAllBars();
    } else {
      console.log("[DH] Scene closing, clearing all bars");
      // Reset deletion-detection cache so cross-scene transitions
      // aren't misread as deletions when the next scene loads.
      knownTrackedItems.clear();
      scaleCache.clear();
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

  // Listen for item changes (scale/resize, deletions) on CHARACTER layer
  OBR.scene.items.onChange(async (items) => {
    // Check tracked tokens for scale changes
    let needsRefresh = false;
    const currentTrackedIds = new Set<string>();

    for (const item of items) {
      if (item.layer !== "CHARACTER" || !isImage(item) || !isItemTracked(item)) {
        continue;
      }

      currentTrackedIds.add(item.id);
      const tokenUuid = getTokenIdFromItem(item);
      if (tokenUuid) {
        knownTrackedItems.set(item.id, tokenUuid);
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

    // Detect tracked tokens that disappeared and clean up their room data.
    // GM-gated to avoid concurrent writes from multiple clients.
    const removedItemIds: string[] = [];
    for (const [obrItemId] of knownTrackedItems) {
      if (!currentTrackedIds.has(obrItemId)) {
        removedItemIds.push(obrItemId);
      }
    }
    if (removedItemIds.length > 0) {
      const gm = await isGM();
      for (const obrItemId of removedItemIds) {
        const tokenUuid = knownTrackedItems.get(obrItemId);
        knownTrackedItems.delete(obrItemId);
        scaleCache.delete(obrItemId);
        if (gm && tokenUuid) {
          await removeTokenStatsById(tokenUuid);
          console.log(`[DH] Cleaned up stats for deleted token ${tokenUuid}`);
        }
      }
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

  // Seed the theme cache before the first render so colors are correct
  // immediately on a cold load.
  const theme = await OBR.theme.getTheme();
  setThemeMode(theme.mode);

  // Check if scene is already ready
  const isReady = await OBR.scene.isReady();
  if (isReady) {
    await refreshAllBars();
  }

  // Set up ongoing listeners
  setupSceneListeners();
}

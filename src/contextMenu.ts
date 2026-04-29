import OBR, { Item } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";
import { loadTokenStats, saveTokenStats } from "./persistence";

/**
 * Get the base URL for this extension, resolving correctly
 * in both local dev and production (GitHub Pages) environments.
 */
function getBaseUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

const trackedFilter = {
  every: [
    { key: "layer", value: "CHARACTER" },
    { key: ["metadata", `${EXTENSION_ID}/tracked`], value: true },
  ],
};

const trackedPCFilter = {
  every: [
    { key: "layer", value: "CHARACTER" },
    { key: ["metadata", `${EXTENSION_ID}/tracked`], value: true },
    { key: ["metadata", `${EXTENSION_ID}/isPC`], value: true },
  ],
};

/**
 * Apply a stat mutation to every item the user invoked the menu on.
 * Errors on a single token don't block the rest.
 */
async function applyToTrackedItems(
  items: Item[],
  mutate: (item: Item) => Promise<void>
): Promise<void> {
  for (const item of items) {
    try {
      await mutate(item);
    } catch (err) {
      console.error(`[DH] Quick action failed for ${item.name}:`, err);
    }
  }
}

/**
 * Set up the context menu for token interaction.
 * Shows the editor entry plus a few inline quick actions for tracked tokens.
 */
export function setupContextMenu(): void {
  console.log("[DH] Setting up context menu");

  const base = getBaseUrl();

  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/context-menu`,
    icons: [
      // Icon for untracked tokens
      {
        icon: `${base}icons/heart-plus.svg`,
        label: "Add Daggerheart Stats",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${EXTENSION_ID}/tracked`], value: undefined },
          ],
        },
      },
      // Icon for tracked tokens
      {
        icon: `${base}icons/heart-edit.svg`,
        label: "Edit Daggerheart Stats",
        filter: trackedFilter,
      },
    ],
    embed: {
      url: `${base}popover.html`,
      height: 320,
    },
  });

  // Quick action: -1 HP on every tracked token in the selection
  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/quick-hp-minus`,
    icons: [
      {
        icon: `${base}icons/heart-minus.svg`,
        label: "−1 HP",
        filter: trackedFilter,
      },
    ],
    onClick: ({ items }) => {
      applyToTrackedItems(items, async (item) => {
        const stats = await loadTokenStats(item);
        if (!stats) return;
        const next = Math.max(0, stats.hp.current - 1);
        if (next === stats.hp.current) return;
        stats.hp.current = next;
        await saveTokenStats(item, stats);
      });
    },
  });

  // Quick action: +1 Stress on every tracked token in the selection
  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/quick-stress-plus`,
    icons: [
      {
        icon: `${base}icons/zap-plus.svg`,
        label: "+1 Stress",
        filter: trackedFilter,
      },
    ],
    onClick: ({ items }) => {
      applyToTrackedItems(items, async (item) => {
        const stats = await loadTokenStats(item);
        if (!stats) return;
        const next = Math.min(stats.stress.max, stats.stress.current + 1);
        if (next === stats.stress.current) return;
        stats.stress.current = next;
        await saveTokenStats(item, stats);
      });
    },
  });

  // Quick action: +1 Hope on tracked PC tokens only (NPCs have no Hope track)
  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/quick-hope-plus`,
    icons: [
      {
        icon: `${base}icons/star-plus.svg`,
        label: "+1 Hope",
        filter: trackedPCFilter,
      },
    ],
    onClick: ({ items }) => {
      applyToTrackedItems(items, async (item) => {
        const stats = await loadTokenStats(item);
        if (!stats || !stats.isPC || stats.hope.max <= 0) return;
        const next = Math.min(stats.hope.max, stats.hope.current + 1);
        if (next === stats.hope.current) return;
        stats.hope.current = next;
        await saveTokenStats(item, stats);
      });
    },
  });
}

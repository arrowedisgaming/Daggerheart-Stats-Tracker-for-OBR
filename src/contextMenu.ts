import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";

/**
 * Set up the context menu for token interaction
 * Shows different options based on whether the token is already tracked
 */
export function setupContextMenu(): void {
  console.log("[DH] Setting up context menu");

  OBR.contextMenu.create({
    id: `${EXTENSION_ID}/context-menu`,
    icons: [
      // Icon for untracked tokens
      {
        icon: "https://esoneill.github.io/obrdhstats/icons/heart-plus.svg",
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
        icon: "https://esoneill.github.io/obrdhstats/icons/heart-edit.svg",
        label: "Edit Daggerheart Stats",
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${EXTENSION_ID}/tracked`], value: true },
          ],
        },
      },
    ],
    embed: {
      url: "https://esoneill.github.io/obrdhstats/popover.html",
      height: 320,
    },
  });
}

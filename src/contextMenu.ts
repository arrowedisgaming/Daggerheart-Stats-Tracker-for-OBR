import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";

/**
 * Get the base URL for this extension, resolving correctly
 * in both local dev and production (GitHub Pages) environments.
 */
function getBaseUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

/**
 * Set up the context menu for token interaction
 * Shows different options based on whether the token is already tracked
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
        filter: {
          every: [
            { key: "layer", value: "CHARACTER" },
            { key: ["metadata", `${EXTENSION_ID}/tracked`], value: true },
          ],
        },
      },
    ],
    embed: {
      url: `${base}popover.html`,
      height: 320,
    },
  });
}

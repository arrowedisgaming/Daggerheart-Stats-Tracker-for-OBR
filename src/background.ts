import OBR from "@owlbear-rodeo/sdk";
import { initializeRendering } from "./listeners";
import { setupContextMenu } from "./contextMenu";

/**
 * Background script - runs automatically when extension loads
 * Ensures bars render even when dashboard is closed
 */
OBR.onReady(async () => {
  console.log("[DH] Background script initialized");

  // Clear any lingering action badge from earlier builds that set one.
  // Safe to call when no badge is set; can be removed once we are sure
  // no installs are still carrying old badge state.
  await OBR.action.setBadgeText(undefined);

  // Set up context menu (only needs to happen once)
  setupContextMenu();

  // Initialize bar rendering and listeners
  await initializeRendering();
});

import OBR from "@owlbear-rodeo/sdk";
import { initializeRendering } from "./listeners";
import { setupContextMenu } from "./contextMenu";

/**
 * Background script - runs automatically when extension loads
 * Ensures bars render even when dashboard is closed
 */
OBR.onReady(async () => {
  console.log("[DH] Background script initialized");

  // Set up context menu (only needs to happen once)
  setupContextMenu();

  // Initialize bar rendering and listeners
  await initializeRendering();
});

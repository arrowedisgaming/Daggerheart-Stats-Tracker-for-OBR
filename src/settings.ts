import OBR from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";

/**
 * Extension-wide settings stored in room metadata
 */
export interface ExtensionSettings {
  hideNpcStatsFromPlayers: boolean;
}

const SETTINGS_KEY = `${EXTENSION_ID}/settings`;

const DEFAULT_SETTINGS: ExtensionSettings = {
  hideNpcStatsFromPlayers: false,
};

/**
 * Load extension settings from room metadata
 */
export async function loadSettings(): Promise<ExtensionSettings> {
  const metadata = await OBR.room.getMetadata();
  return (metadata[SETTINGS_KEY] as ExtensionSettings) || DEFAULT_SETTINGS;
}

/**
 * Save extension settings to room metadata
 */
export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await OBR.room.setMetadata({ [SETTINGS_KEY]: settings });
}

/**
 * Check if the current user is the GM
 */
export async function isGM(): Promise<boolean> {
  const role = await OBR.player.getRole();
  return role === "GM";
}

import { DaggerheartStats } from "./types";

/**
 * Extension identifier - used for metadata keys and namespacing
 */
export const EXTENSION_ID = "daggerheart-tracker";

/**
 * Badge display constants (new compact format)
 * Colored circles with numbers inside, positioned above the token
 */
export const BADGE_SIZE = 28; // Circle diameter
export const BADGE_GAP = 4; // Spacing between badges
export const BADGE_FONT_SIZE = 16; // Font size for the number

/**
 * Color schemes for each stat type
 * Using Tailwind color palette for consistency
 */
export const COLORS = {
  hp: {
    filled: "#dc2626", // red-600
    empty: "#450a0a", // red-950
    stroke: "#7f1d1d", // red-900
  },
  stress: {
    filled: "#9333ea", // purple-600
    empty: "#3b0764", // purple-950
    stroke: "#581c87", // purple-900
  },
  hope: {
    filled: "#eab308", // yellow-500
    empty: "#422006", // yellow-950
    stroke: "#713f12", // yellow-900
  },
  armor: {
    filled: "#6b7280", // gray-500
    empty: "#1f2937", // gray-800
    stroke: "#374151", // gray-700
  },
} as const;

export type StatType = keyof typeof COLORS;

/**
 * Default stats for PC tokens
 * All stats default to 0/5
 */
export const DEFAULT_PC_STATS: DaggerheartStats = {
  hp: { current: 0, max: 5 },
  stress: { current: 0, max: 5 },
  hope: { current: 0, max: 5 },
  armor: { current: 0, max: 5 },
  isPC: true,
};

/**
 * Default stats for NPC tokens
 * NPCs don't track Hope or Armor (max = 0 hides them)
 */
export const DEFAULT_NPC_STATS: DaggerheartStats = {
  hp: { current: 0, max: 5 },
  stress: { current: 0, max: 5 },
  hope: { current: 0, max: 0 },
  armor: { current: 0, max: 0 },
  isPC: false,
};

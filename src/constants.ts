import { DaggerheartStats } from "./types";

/**
 * Extension identifier - used for metadata keys and namespacing
 */
export const EXTENSION_ID = "daggerheart-tracker";

/**
 * Badge display constants (compact format)
 * Dark circles with glyph+number inside, positioned above the token.
 * Badge size scales with token width, clamped to this range.
 */
export const BADGE_SIZE_MIN = 16; // Minimum circle diameter (world units)
export const BADGE_SIZE_MAX = 36; // Maximum circle diameter (world units)
export const BADGE_GAP_RATIO = 0.15; // Gap as fraction of badge size
export const BADGE_FONT_RATIO = 0.55; // Font size as fraction of badge size
export const BADGE_FONT_RATIO_REDUCED = 0.42; // Reduced font for 3+ char strings (e.g. "♥10")

/**
 * Uniform badge colors — glyphs provide stat differentiation
 */
export const BADGE_COLORS = {
  fill: "#1e293b", // slate-800
  stroke: "#475569", // slate-600
  text: "#f8fafc", // slate-50
} as const;

/**
 * Legacy per-stat colors (kept for popover UI)
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
 * Unicode glyphs for each stat type (accessibility — not color-dependent)
 */
export const GLYPHS: Record<StatType, string> = {
  hp: "♥",
  stress: "‼",
  armor: "⛊",
  hope: "✹",
};

/**
 * Per-glyph font scale multipliers — applied on top of the base font ratio.
 * Adjusts for glyphs that render naturally larger/smaller at the same font size.
 */
export const GLYPH_FONT_SCALE: Record<StatType, number> = {
  hp: 0.88,    // heart renders large, scale down to avoid crowding the number
  stress: 1.0,
  armor: 1.20, // shield renders small, scale up for visibility
  hope: 1.0,
};

/**
 * Whether to add a space between the glyph and the number.
 */
export const GLYPH_SPACING: Record<StatType, string> = {
  hp: " ",
  stress: " ",
  armor: "",
  hope: "",
};

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

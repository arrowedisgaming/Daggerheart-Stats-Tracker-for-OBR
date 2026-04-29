import { Command, PathCommand } from "@owlbear-rodeo/sdk";
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
export const BADGE_FONT_RATIO_REDUCED = 0.50; // Reduced font for 2-digit numbers

/**
 * Uniform badge colors — glyphs provide stat differentiation.
 * Two palettes so badges adapt to OBR's light/dark theme.
 */
export const BADGE_COLORS_DARK = {
  fill: "#1e293b", // slate-800
  stroke: "#f8fafc", // slate-50 (white)
  text: "#f8fafc", // slate-50
} as const;

export const BADGE_COLORS_LIGHT = {
  fill: "#f8fafc", // slate-50
  stroke: "#1e293b", // slate-800
  text: "#0f172a", // slate-900
} as const;

export type ThemeMode = "DARK" | "LIGHT";

export function getBadgeColors(mode: ThemeMode) {
  return mode === "LIGHT" ? BADGE_COLORS_LIGHT : BADGE_COLORS_DARK;
}

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
  stress: "⚡",
  armor: "⛊",
  hope: "✹",
};


/**
 * Vector glyph paths — normalized coordinates (unit scale, centered at origin).
 * Each path fits roughly within a -0.5..0.5 bounding box.
 */

/** Heart (HP) — two-lobed heart with bottom point */
const HEART_PATH: PathCommand[] = [
  [Command.MOVE, 0, 0.4],
  [Command.CUBIC, -0.1, 0.2, -0.5, 0.05, -0.5, -0.15],
  [Command.CUBIC, -0.5, -0.4, -0.15, -0.55, 0, -0.35],
  [Command.CUBIC, 0.15, -0.55, 0.5, -0.4, 0.5, -0.15],
  [Command.CUBIC, 0.5, 0.05, 0.1, 0.2, 0, 0.4],
  [Command.CLOSE],
];

/** Lightning bolt (Stress) — jagged bolt shape, wide stroke */
const STRESS_PATH: PathCommand[] = [
  [Command.MOVE, 0.15, -0.5],
  [Command.LINE, -0.25, 0.0],
  [Command.LINE, 0.08, 0.0],
  [Command.LINE, -0.15, 0.5],
  [Command.LINE, 0.40, -0.1],
  [Command.LINE, 0.10, -0.1],
  [Command.CLOSE],
];

/** Shield (Armor) — wide top tapering to a point at bottom */
const ARMOR_PATH: PathCommand[] = [
  [Command.MOVE, 0, 0.5],
  [Command.CUBIC, -0.15, 0.3, -0.45, 0.15, -0.45, -0.05],
  [Command.LINE, -0.45, -0.45],
  [Command.LINE, 0.45, -0.45],
  [Command.LINE, 0.45, -0.05],
  [Command.CUBIC, 0.45, 0.15, 0.15, 0.3, 0, 0.5],
  [Command.CLOSE],
];

/** 8-pointed star (Hope) — alternating outer/inner radius points */
const HOPE_PATH: PathCommand[] = [
  [Command.MOVE, 0, -0.5],
  [Command.LINE, 0.08, -0.18],
  [Command.LINE, 0.35, -0.35],
  [Command.LINE, 0.18, -0.08],
  [Command.LINE, 0.5, 0],
  [Command.LINE, 0.18, 0.08],
  [Command.LINE, 0.35, 0.35],
  [Command.LINE, 0.08, 0.18],
  [Command.LINE, 0, 0.5],
  [Command.LINE, -0.08, 0.18],
  [Command.LINE, -0.35, 0.35],
  [Command.LINE, -0.18, 0.08],
  [Command.LINE, -0.5, 0],
  [Command.LINE, -0.18, -0.08],
  [Command.LINE, -0.35, -0.35],
  [Command.LINE, -0.08, -0.18],
  [Command.CLOSE],
];

/** Lookup: normalized path commands per stat type */
export const GLYPH_PATHS: Record<StatType, PathCommand[]> = {
  hp: HEART_PATH,
  stress: STRESS_PATH,
  armor: ARMOR_PATH,
  hope: HOPE_PATH,
};

/** Glyph diameter as fraction of badge size */
export const GLYPH_PATH_SCALE = 0.65;

/** Glyph center Y offset as fraction of badge size (negative = above circle center) */
export const GLYPH_Y_OFFSET_RATIO = -0.55;

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

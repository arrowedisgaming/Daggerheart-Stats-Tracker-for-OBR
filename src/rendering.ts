import { buildShape, buildText, buildLine, Image, Math2, Item } from "@owlbear-rodeo/sdk";
import {
  EXTENSION_ID,
  BADGE_COLORS,
  BADGE_SIZE_MIN,
  BADGE_SIZE_MAX,
  BADGE_GAP_RATIO,
  BADGE_FONT_RATIO,
  BADGE_FONT_RATIO_REDUCED,
  GLYPHS,
  GLYPH_FONT_SCALE,
  GLYPH_SPACING,
  StatType,
} from "./constants";
import { DaggerheartStats } from "./types";

/**
 * Calculate the center position of an image token in world coordinates
 * Based on Owl Trackers' implementation
 */
function getImageCenter(image: Image, sceneDpi: number) {
  // Image center with respect to image center
  let imageCenter = { x: 0, y: 0 };

  // Find image center with respect to image top left corner
  imageCenter = Math2.add(
    imageCenter,
    Math2.multiply(
      {
        x: image.image.width,
        y: image.image.height,
      },
      0.5
    )
  );

  // Find image center with respect to item position
  imageCenter = Math2.subtract(imageCenter, image.grid.offset);
  imageCenter = Math2.multiply(imageCenter, sceneDpi / image.grid.dpi);
  imageCenter = Math2.multiply(imageCenter, image.scale);
  imageCenter = Math2.rotate(imageCenter, { x: 0, y: 0 }, image.rotation);

  // find image center with respect to world
  imageCenter = Math2.add(imageCenter, image.position);

  return imageCenter;
}

/**
 * Calculate the bounds (width/height) of an image token accounting for scale and DPI
 * Based on Owl Trackers' implementation
 */
function getImageBounds(item: Image, dpi: number) {
  const dpiScale = dpi / item.grid.dpi;
  const width = item.image.width * dpiScale * item.scale.x;
  const height = item.image.height * dpiScale * item.scale.y;
  return { width: Math.abs(width), height: Math.abs(height) };
}

/**
 * Build a single stat badge (dark circle with glyph+number inside)
 *
 * @param tokenId - The ID of the token to attach to
 * @param statType - Which stat this badge represents (for glyph)
 * @param currentValue - The current value to display
 * @param position - Center position for the badge
 * @param badgeSize - Computed badge diameter (scales with token)
 * @param critical - Whether this stat is in its critical/depleted state
 * @returns Array containing the circle shape, text label, and optional slash overlay
 */
function buildStatBadge(
  tokenId: string,
  statType: StatType,
  currentValue: number,
  position: { x: number; y: number },
  badgeSize: number,
  critical: boolean
): Item[] {
  // Font sizes: number uses base ratio only, glyph also applies per-stat scale
  const baseFontRatio = currentValue >= 10 ? BADGE_FONT_RATIO_REDUCED : BADGE_FONT_RATIO;
  const numberFontSize = Math.round(badgeSize * baseFontRatio);
  const glyphFontSize = Math.round(badgeSize * baseFontRatio * GLYPH_FONT_SCALE[statType]);
  const boxWidth = badgeSize; // each text item gets a box this wide
  const textHeight = badgeSize + 2;

  // Estimate visual widths to compute split point offset.
  // The glyph and number meet at a split point; we shift it so the
  // combined visual center aligns with the circle center.
  const hasSpace = GLYPH_SPACING[statType].length > 0;
  const glyphVisualWidth = glyphFontSize * 0.7 + (hasSpace ? glyphFontSize * 0.3 : 0);
  const digitCount = String(currentValue).length;
  const numberVisualWidth = numberFontSize * 0.55 * digitCount;
  const splitOffset = (glyphVisualWidth - numberVisualWidth) / 2;
  const splitX = position.x + splitOffset;

  const items: Item[] = [];

  // Dark circle background — always centered at position
  const circle = buildShape()
    .shapeType("CIRCLE")
    .width(badgeSize)
    .height(badgeSize)
    .position(position)
    .fillColor(BADGE_COLORS.fill)
    .fillOpacity(0.85)
    .strokeColor(BADGE_COLORS.stroke)
    .strokeWidth(1)
    .strokeOpacity(0.6)
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .visible(true)
    .layer("ATTACHMENT")
    .disableAttachmentBehavior(["ROTATION", "COPY", "SCALE"])
    .metadata({
      [`${EXTENSION_ID}/type`]: "stat-badge",
      [`${EXTENSION_ID}/tokenId`]: tokenId,
      [`${EXTENSION_ID}/stat`]: statType,
    })
    .build();

  items.push(circle);

  // Glyph — right-aligned, ending at the split point
  const glyphText = `${GLYPHS[statType]}${GLYPH_SPACING[statType]}`;
  const glyph = buildText()
    .textType("PLAIN")
    .plainText(glyphText)
    .fontSize(glyphFontSize)
    .fontWeight(700)
    .fontFamily("Roboto, sans-serif")
    .textAlign("RIGHT")
    .textAlignVertical("MIDDLE")
    .fillColor(BADGE_COLORS.text)
    .position({
      x: splitX - boxWidth,
      y: position.y - badgeSize / 2 - 1,
    })
    .width(boxWidth)
    .height(textHeight)
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .visible(true)
    .layer("TEXT")
    .disableAttachmentBehavior(["ROTATION", "COPY", "SCALE"])
    .metadata({
      [`${EXTENSION_ID}/type`]: "stat-badge-glyph",
      [`${EXTENSION_ID}/tokenId`]: tokenId,
      [`${EXTENSION_ID}/stat`]: statType,
    })
    .build();

  items.push(glyph);

  // Number — left-aligned, starting at the split point
  const number = buildText()
    .textType("PLAIN")
    .plainText(`${currentValue}`)
    .fontSize(numberFontSize)
    .fontWeight(700)
    .fontFamily("Roboto, sans-serif")
    .textAlign("LEFT")
    .textAlignVertical("MIDDLE")
    .fillColor(BADGE_COLORS.text)
    .position({
      x: splitX,
      y: position.y - badgeSize / 2 - 1,
    })
    .width(boxWidth)
    .height(textHeight)
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .visible(true)
    .layer("TEXT")
    .disableAttachmentBehavior(["ROTATION", "COPY", "SCALE"])
    .metadata({
      [`${EXTENSION_ID}/type`]: "stat-badge-text",
      [`${EXTENSION_ID}/tokenId`]: tokenId,
      [`${EXTENSION_ID}/stat`]: statType,
    })
    .build();

  items.push(number);

  // Diagonal line through circle when stat is in critical state
  if (critical) {
    const r = badgeSize / 2;
    // Line from bottom-left to top-right of the circle, at 45°
    const offset = r * Math.cos(Math.PI / 4); // ≈ 0.707 * radius
    const slash = buildLine()
      .startPosition({
        x: position.x - offset,
        y: position.y + offset,
      })
      .endPosition({
        x: position.x + offset,
        y: position.y - offset,
      })
      .strokeColor("#ef4444") // red-500
      .strokeWidth(3)
      .strokeOpacity(1)
      .attachedTo(tokenId)
      .locked(true)
      .disableHit(true)
      .visible(true)
      .layer("TEXT")
      .disableAttachmentBehavior(["ROTATION", "COPY", "SCALE"])
      .metadata({
        [`${EXTENSION_ID}/type`]: "stat-badge-slash",
        [`${EXTENSION_ID}/tokenId`]: tokenId,
        [`${EXTENSION_ID}/stat`]: statType,
      })
      .build();

    items.push(slash);
  }

  return items;
}

/**
 * Build all stat badges for a token
 *
 * Layout: Horizontal row of colored circles above the token
 * Order: HP, Stress, Armor (if PC), Hope (if PC)
 *
 * Each badge shows the current value only (not max) for compactness.
 */
export function buildAllBars(
  item: Image,
  stats: DaggerheartStats,
  sceneDpi: number
): Item[] {
  const allItems: Item[] = [];

  // Calculate token bounds and center
  const bounds = getImageBounds(item, sceneDpi);
  const origin = getImageCenter(item, sceneDpi);

  // Determine which stats to show and whether each is in its critical state.
  // HP/Stress/Armor are "damage tracks" — critical when current === max (fully marked).
  // Hope is a spendable resource — critical when current === 0 (spent all hope).
  const statsToShow: { type: StatType; value: number; critical: boolean }[] = [];

  statsToShow.push({ type: "hp", value: stats.hp.current, critical: stats.hp.current === stats.hp.max });
  statsToShow.push({ type: "stress", value: stats.stress.current, critical: stats.stress.current === stats.stress.max });

  if (stats.armor.max > 0) {
    statsToShow.push({ type: "armor", value: stats.armor.current, critical: stats.armor.current === stats.armor.max });
  }
  if (stats.hope.max > 0) {
    statsToShow.push({ type: "hope", value: stats.hope.current, critical: stats.hope.current === 0 });
  }

  // Compute badge size to fit within token width
  const count = statsToShow.length;
  // Solve: count * size + (count - 1) * (size * GAP_RATIO) <= tokenWidth
  // size * (count + (count - 1) * GAP_RATIO) <= tokenWidth
  const fitSize = bounds.width / (count + (count - 1) * BADGE_GAP_RATIO);
  const badgeSize = Math.max(BADGE_SIZE_MIN, Math.min(BADGE_SIZE_MAX, fitSize));
  const gap = badgeSize * BADGE_GAP_RATIO;

  // Calculate total width of all badges
  const totalWidth = count * badgeSize + (count - 1) * gap;

  // Position badges above token, centered horizontally
  const startX = origin.x - totalWidth / 2 + badgeSize / 2;
  const badgeY = origin.y - bounds.height / 2 - badgeSize / 2 - 4;

  // Build each badge
  statsToShow.forEach((stat, index) => {
    const x = startX + index * (badgeSize + gap);
    allItems.push(...buildStatBadge(item.id, stat.type, stat.value, { x, y: badgeY }, badgeSize, stat.critical));
  });

  return allItems;
}

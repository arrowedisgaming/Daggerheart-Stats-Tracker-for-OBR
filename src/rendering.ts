import { buildShape, buildText, buildLine, buildPath, Command, Image, Math2, Item, PathCommand } from "@owlbear-rodeo/sdk";
import {
  EXTENSION_ID,
  BADGE_SIZE_MIN,
  BADGE_SIZE_MAX,
  BADGE_GAP_RATIO,
  BADGE_FONT_RATIO,
  BADGE_FONT_RATIO_REDUCED,
  COLORS,
  GLYPH_PATHS,
  GLYPH_PATH_SCALE,
  GLYPH_Y_OFFSET_RATIO,
  StatType,
  ThemeMode,
  getBadgeColors,
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
 * Scale and translate normalized path commands to world coordinates.
 * Each command type has a known number of coordinate pairs.
 */
function scalePathCommands(
  normalized: PathCommand[],
  scale: number,
  offset: { x: number; y: number }
): PathCommand[] {
  return normalized.map((cmd): PathCommand => {
    switch (cmd[0]) {
      case Command.MOVE:
        return [Command.MOVE, cmd[1] * scale + offset.x, cmd[2] * scale + offset.y];
      case Command.LINE:
        return [Command.LINE, cmd[1] * scale + offset.x, cmd[2] * scale + offset.y];
      case Command.CUBIC:
        return [
          Command.CUBIC,
          cmd[1] * scale + offset.x, cmd[2] * scale + offset.y,
          cmd[3] * scale + offset.x, cmd[4] * scale + offset.y,
          cmd[5] * scale + offset.x, cmd[6] * scale + offset.y,
        ];
      case Command.CLOSE:
        return [Command.CLOSE];
      default:
        return cmd;
    }
  });
}

/**
 * Build a stat badge: dark circle + vector glyph above + centered number inside.
 *
 * @param tokenId - The ID of the token to attach to
 * @param statType - Which stat this badge represents (determines glyph shape + color)
 * @param currentValue - The current value to display
 * @param position - Center position for the badge circle
 * @param badgeSize - Computed badge diameter (scales with token)
 * @param critical - Whether this stat is in its critical/depleted state
 */
function buildStatBadge(
  tokenId: string,
  statType: StatType,
  currentValue: number,
  position: { x: number; y: number },
  badgeSize: number,
  critical: boolean,
  themeMode: ThemeMode
): Item[] {
  const items: Item[] = [];
  const baseFontRatio = currentValue >= 10 ? BADGE_FONT_RATIO_REDUCED : BADGE_FONT_RATIO;
  const numberFontSize = Math.round(badgeSize * baseFontRatio);
  const statColors = COLORS[statType];
  const badgeColors = getBadgeColors(themeMode);

  // 1. Dark circle background
  const circle = buildShape()
    .shapeType("CIRCLE")
    .width(badgeSize)
    .height(badgeSize)
    .position(position)
    .fillColor(badgeColors.fill)
    .fillOpacity(0.85)
    .strokeColor(badgeColors.stroke)
    .strokeWidth(2)
    .strokeOpacity(0.8)
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

  // 2. Vector glyph path — positioned above the circle center
  const glyphCenter = {
    x: position.x,
    y: position.y + badgeSize * GLYPH_Y_OFFSET_RATIO,
  };
  const scaledCommands = scalePathCommands(
    GLYPH_PATHS[statType],
    badgeSize * GLYPH_PATH_SCALE,
    glyphCenter
  );
  const glyphPath = buildPath()
    .commands(scaledCommands)
    .fillColor(statColors.filled)
    .fillOpacity(1)
    .strokeColor(statColors.stroke)
    .strokeWidth(0.5)
    .strokeOpacity(0.8)
    .position({ x: 0, y: 0 })
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .visible(true)
    .layer("ATTACHMENT")
    .disableAttachmentBehavior(["ROTATION", "COPY", "SCALE"])
    .metadata({
      [`${EXTENSION_ID}/type`]: "stat-badge-glyph-path",
      [`${EXTENSION_ID}/tokenId`]: tokenId,
      [`${EXTENSION_ID}/stat`]: statType,
    })
    .build();
  items.push(glyphPath);

  // 3. Centered number inside the circle
  const numberText = buildText()
    .textType("PLAIN")
    .plainText(`${currentValue}`)
    .fontSize(numberFontSize)
    .fontWeight(700)
    .fontFamily("Roboto, sans-serif")
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fillColor(badgeColors.text)
    .position({
      x: position.x - badgeSize / 2,
      y: position.y - badgeSize / 2 - 1,
    })
    .width(badgeSize)
    .height(badgeSize + 2)
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
  items.push(numberText);

  // 4. Critical slash — diagonal line through circle
  if (critical) {
    const r = badgeSize / 2;
    const offset = r * Math.cos(Math.PI / 4);
    const slash = buildLine()
      .startPosition({
        x: position.x - offset,
        y: position.y + offset,
      })
      .endPosition({
        x: position.x + offset,
        y: position.y - offset,
      })
      .strokeColor("#ef4444")
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
 * Layout: Horizontal row of dark circles with vector glyphs above the token
 * Order: HP, Stress, Armor (if PC), Hope (if PC)
 *
 * Each badge shows the current value only (not max) for compactness.
 */
export function buildAllBars(
  item: Image,
  stats: DaggerheartStats,
  sceneDpi: number,
  themeMode: ThemeMode = "DARK"
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

  // Position badges above token, centered horizontally.
  // Extra vertical space for the heart glyph that overhangs above the circle.
  const glyphOverhang = badgeSize * 0.35;
  const startX = origin.x - totalWidth / 2 + badgeSize / 2;
  const badgeY = origin.y - bounds.height / 2 - badgeSize / 2 - 4 - glyphOverhang;

  // Build each badge
  statsToShow.forEach((stat, index) => {
    const x = startX + index * (badgeSize + gap);
    allItems.push(...buildStatBadge(item.id, stat.type, stat.value, { x, y: badgeY }, badgeSize, stat.critical, themeMode));
  });

  return allItems;
}

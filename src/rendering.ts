import { buildShape, buildText, Image, Math2, Item } from "@owlbear-rodeo/sdk";
import {
  EXTENSION_ID,
  COLORS,
  BADGE_SIZE,
  BADGE_GAP,
  BADGE_FONT_SIZE,
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
 * Build a single stat badge (colored circle with number inside)
 *
 * @param tokenId - The ID of the token to attach to
 * @param statType - Which stat this badge represents (for coloring)
 * @param currentValue - The current value to display
 * @param position - Center position for the badge
 * @returns Array containing the circle shape and text label
 */
function buildStatBadge(
  tokenId: string,
  statType: StatType,
  currentValue: number,
  position: { x: number; y: number }
): Item[] {
  const colors = COLORS[statType];
  const items: Item[] = [];

  // Colored circle background
  const circle = buildShape()
    .shapeType("CIRCLE")
    .width(BADGE_SIZE)
    .height(BADGE_SIZE)
    .position(position)
    .fillColor(colors.filled)
    .fillOpacity(0.9)
    .strokeColor(colors.stroke)
    .strokeWidth(2)
    .strokeOpacity(1)
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

  // Number text centered on circle
  // Text position is top-left of bounding box, so offset to center on circle
  const text = buildText()
    .textType("PLAIN")
    .plainText(String(currentValue))
    .fontSize(BADGE_FONT_SIZE)
    .fontWeight(700)
    .textAlign("CENTER")
    .position({
      x: position.x - BADGE_SIZE / 2,
      y: position.y - BADGE_SIZE / 2 + 2
    })
    .width(BADGE_SIZE)
    .height(BADGE_SIZE)
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .visible(true)
    .layer("ATTACHMENT")
    .disableAttachmentBehavior(["ROTATION", "COPY", "SCALE"])
    .metadata({
      [`${EXTENSION_ID}/type`]: "stat-badge-text",
      [`${EXTENSION_ID}/tokenId`]: tokenId,
      [`${EXTENSION_ID}/stat`]: statType,
    })
    .build();

  items.push(text);

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

  // Determine which stats to show
  const statsToShow: { type: StatType; value: number }[] = [];

  // Always show HP and Stress
  statsToShow.push({ type: "hp", value: stats.hp.current });
  statsToShow.push({ type: "stress", value: stats.stress.current });

  // Show Armor and Hope only for PCs (when max > 0)
  if (stats.armor.max > 0) {
    statsToShow.push({ type: "armor", value: stats.armor.current });
  }
  if (stats.hope.max > 0) {
    statsToShow.push({ type: "hope", value: stats.hope.current });
  }

  // Calculate total width of all badges
  const totalWidth = statsToShow.length * BADGE_SIZE + (statsToShow.length - 1) * BADGE_GAP;

  // Position badges above token, centered horizontally
  const startX = origin.x - totalWidth / 2 + BADGE_SIZE / 2;
  const badgeY = origin.y - bounds.height / 2 - BADGE_SIZE / 2 - 5;

  // Build each badge
  statsToShow.forEach((stat, index) => {
    const x = startX + index * (BADGE_SIZE + BADGE_GAP);
    allItems.push(...buildStatBadge(item.id, stat.type, stat.value, { x, y: badgeY }));
  });

  return allItems;
}

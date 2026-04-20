---
title: Daggerheart Stats Tracker
description: Simple HP, Stress, Hope, and Armor tracking for Daggerheart
author: Arrowed
image: https://raw.githubusercontent.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/main/docs/images/PCs-hero.png
icon: https://arrowedisgaming.github.io/Daggerheart-Stats-Tracker-for-OBR/icon.svg
tags:
  - combat
  - tool
manifest: https://arrowedisgaming.github.io/Daggerheart-Stats-Tracker-for-OBR/manifest.json
learn-more: https://github.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR
---

# Daggerheart Stats Tracker

Compact circular badges render above each character token showing HP, Stress, Armor, and Hope — with stat glyphs, critical state indicators, and cross-scene persistence.

![PC token with stat badges and the Party Stats dashboard](https://raw.githubusercontent.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/main/docs/images/StatsAndList.png)

**Circular Stat Badges**

Each tracked token gets compact badges above it displaying current values with colored vector glyphs — ♥ HP, ⚡ Stress, ⛊ Armor, ✹ Hope. Badges scale proportionally with token size so they stay readable at any zoom level.

**Critical State Indicators**

A red slash overlay appears when a stat reaches its critical state — HP, Stress, or Armor at maximum, or Hope at zero — so danger is visible at a glance.

**PC and NPC Modes**

Player Characters track all four stats. NPCs show only HP and Stress by default, keeping their badges visually lighter. GMs can also hide NPC badges from the scene entirely.

| PC (all 4 stats) | NPC (HP & Stress only) | NPC with critical state |
|:-:|:-:|:-:|
| ![](https://raw.githubusercontent.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/main/docs/images/PCs-hero.png) | ![](https://raw.githubusercontent.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/main/docs/images/NPC1.png) | ![](https://raw.githubusercontent.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/main/docs/images/NPC-Full.png) |

**Party Stats Dashboard**

Click the Daggerheart Stats Tracker icon in the toolbar to open a live summary of all PC stats in the current scene. Auto-updates as stats change, with a collapsible NPC section for GMs.

**Cross-Scene Persistence**

Stats are stored in room metadata, so they survive scene changes within the same room. Each token is tracked by a stable UUID — renaming or copying tokens won't break their stats.

**Math Expressions**

Type `+2` or `-3` in any stat field and press Enter to apply the delta and save in one step.

## How to Use

**Add stats to a token**

Right-click a character token → **Add Daggerheart Stats**, then set HP, Stress, Armor, and Hope. Badges appear above the token automatically.

**Edit stats**

Right-click a tracked token → **Edit Daggerheart Stats**. Adjust values directly, or type math expressions like `+2` or `-1` and press Enter. Toggle between PC and NPC mode as needed.

![Right-click context menu and stat editor popover](https://raw.githubusercontent.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/main/docs/images/RightClickPC.png)

## Stats Reference

| Stat   | Glyph | Color  | Default (PC) | Default (NPC) |
| ------ | ----- | ------ | ------------ | ------------- |
| HP     | ♥     | Red    | 6/6          | 6/6           |
| Stress | ⚡     | Purple | 0/6          | 0/6           |
| Armor  | ⛊     | Gray   | 0/6          | Hidden        |
| Hope   | ✹     | Gold   | 2/5          | Hidden        |

## Credits

Based on [Owl Trackers](https://github.com/SeamusFinlayson/owl-trackers) by Seamus Finlayson, licensed under GNU GPLv3. Modified for Daggerheart by Arrowed.

## Support

For bug reports, feature requests, or questions, open an issue on [GitHub](https://github.com/arrowedisgaming/Daggerheart-Stats-Tracker-for-OBR/issues).

# Daggerheart Tracker for Owlbear Rodeo

A simplified Owlbear Rodeo extension for tracking Daggerheart RPG character stats (HP, Stress, Hope, Armor) with visual discrete segment bars that persist across scene changes.

## Features

- **Simple Stat Tracking**: Track HP, Stress, Armor, and Hope for characters
- **Party Stats Dashboard**: View all PC stats at a glance in the action popover (new in v0.2.0)
- **Cross-Scene Persistence**: Token stats survive scene changes within the same room
- **Visual Feedback**: Discrete segment bars above tokens show stats at a glance
- **Multiplayer Support**: Any player can add/edit stats on their tokens, everyone sees all bars
- **PC/NPC Support**: Toggle between PC (with Hope & Armor) and NPC (simplified stats) modes
- **Easy to Use**: Right-click any CHARACTER token to add or edit stats

## Prerequisites

Before you can run this extension, you need:

- **Node.js 18+** (currently not installed)
- **npm** or **pnpm** package manager

### Installing Node.js

1. Visit https://nodejs.org/
2. Download and install the LTS version
3. Restart your terminal after installation

## Setup

Once Node.js is installed:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The dev server will start at `http://localhost:5173`

## Adding to Owlbear Rodeo

1. Go to https://www.owlbear.rodeo and sign in
2. Click your profile icon (top right)
3. Go to **Extensions**
4. Click **Add Extension**
5. Paste: `http://localhost:5173/manifest.json`
6. Click **Add**

## Using in a Room

1. Open or create an Owlbear Rodeo room
2. Click the **Extensions** button (puzzle piece icon)
3. Toggle on "Daggerheart Tracker"
4. Click the **Daggerheart Tracker** icon in the toolbar to view the Party Stats dashboard
5. Right-click any CHARACTER token and select:
   - **Add Daggerheart Stats** (for new tokens)
   - **Edit Daggerheart Stats** (for tracked tokens)

### Party Stats Dashboard

The action popover shows a live dashboard of all PC stats in the current scene:
- View HP, Stress, Armor, and Hope for all party members at once
- Auto-updates when stats change
- Only shows PCs (NPCs are hidden from this view)

## How It Works

### Data Persistence

- **Room Metadata**: Stats are stored in room metadata, surviving scene changes
- **Token Key**: Tokens are identified by `{name}::{imageHash}` for stability across scenes
- **Item Metadata**: Tracks which tokens have stats enabled for quick filtering

### Visual Rendering

- **Shared Items**: Bars are visible to all players in the room
- **Discrete Segments**: Each stat point is a colored rectangle
- **Attachment**: Bars are attached to tokens and move with them
- **Vertical Stacking**: Bars stack vertically above tokens (HP → Stress → Armor → Hope)

### Stats Tracked

**Rendering Order (top to bottom):**

| Stat   | Type        | Visual  | Default PC | Default NPC        |
| ------ | ----------- | ------- | ---------- | ------------------ |
| HP     | current/max | Red     | 6/6        | 6/6                |
| Stress | current/max | Purple  | 0/6        | 0/6                |
| Armor  | current/max | Gray    | 0/6        | 0/0 (hidden)       |
| Hope   | current/max | Gold    | 2/5        | 0/0 (hidden)       |

**Note**: NPCs hide both Armor and Hope bars (max set to 0). Only HP and Stress are shown for NPCs.

## Project Structure

```
src/
├── main.tsx              # Main entry point
├── types.ts              # TypeScript interfaces
├── constants.ts          # Colors, dimensions, defaults
├── persistence.ts        # Room metadata storage
├── itemMetadata.ts       # Item-level tracking marks
├── rendering.ts          # Bar/segment builders
├── lifecycle.ts          # Render/clear/refresh functions
├── contextMenu.ts        # Context menu setup
├── listeners.ts          # Scene change handlers
├── actions.ts            # High-level user actions
└── popover/
    ├── main.tsx          # Popover entry point
    ├── Popover.tsx       # Main edit UI
    ├── StatInput.tsx     # Reusable stat input
    └── popover.css       # Popover styles
```

## Building for Production

```bash
npm run build
```

Output goes to `dist/` folder. You can host this on:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Any static hosting service

## Troubleshooting

### Extension doesn't appear
- Ensure dev server is running (`npm run dev`)
- Check the manifest URL is correct
- Look for errors in browser console

### Bars don't render
- Check that tokens are on the CHARACTER layer
- Verify scene is ready in console logs
- Check browser console for errors

### Stats don't persist
- Verify room metadata in console: `await OBR.room.getMetadata()`
- Check that token key is consistent
- Look for save/load errors in console

## Changelog

### v0.2.0
- **Party Stats Dashboard**: Added live dashboard showing all PC stats in the action popover
- **NPC Mode Update**: NPCs now hide both Armor and Hope bars (not just Hope)
- **UI Improvements**: Reordered stat inputs to match visual rendering order (HP → Stress → Armor → Hope)

### v0.1.9
- Changed Armor from simple number to current/max tracking (like other stats)
- Updated bar positioning to render directly above tokens
- Improved visual stacking order

### v0.1.0 - v0.1.8
- Initial release with core functionality
- Cross-scene persistence via room metadata
- Multiplayer support with shared bars
- Context menu integration
- PC/NPC toggle support

## License

Based on [Owl Trackers](https://github.com/SeamusFinlayson/owl-trackers) by Seamus Finlayson, licensed under GNU GPLv3.

Modified for Daggerheart by Edmund.

This project is licensed under GNU GPLv3.

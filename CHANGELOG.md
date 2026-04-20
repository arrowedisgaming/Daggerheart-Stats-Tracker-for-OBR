# Changelog

All notable changes to Daggerheart Stats Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.9.0] - 2026-04-20

### Added
- **OBR Extension Store listing**: New `docs/store.md` with frontmatter, hero image, feature breakdown, and support contact (replaces leftover Owl Trackers listing)
- **LICENSE file**: GNU GPLv3 added to repo root (previously declared only in README)
- **`package.json` metadata**: Added `license`, `repository`, `homepage`, and `bugs` fields for store and registry compatibility
- **Shared design tokens**: Unified CSS custom properties (`tokens.css`) used by both dashboard and popover for consistent theming
- **Dark theme dashboard**: Dashboard now matches OBR's dark UI instead of the previous light theme
- **NPC section in dashboard**: GM users see a collapsible "NPCs (N)" section below PCs, collapsed by default
- **Clickable dashboard cards**: Click any character card in the dashboard to open the editing popover directly
- **Remove confirmation**: Remove button now requires a two-step confirmation (click → "Confirm Remove?" / "Cancel") to prevent accidental deletion
- **Save feedback**: "Saved!" flash on success (auto-closes after 800ms); error message stays visible on failure
- **Accessible form labels**: All stat inputs now have proper `id`/`htmlFor` associations and `aria-label` attributes for screen readers
- **Focus-visible styles**: Keyboard focus rings (`--dh-focus-ring`) on all interactive elements (buttons, inputs, checkboxes, cards)
- **Token name overflow**: Long character names in dashboard cards now show ellipsis instead of breaking layout

### Changed
- **Renamed to "Daggerheart Stats Tracker"**: Updated display name across manifest (`name`, `action.title`), dashboard heading, browser tab title, README, and store listing for consistency. The on-disk extension ID (`daggerheart-tracker`) and persisted metadata namespaces are unchanged, so existing installs and saved stats are unaffected.
- **Version**: Dropped `-alpha` suffix; this is the first release prepared for the OBR Extension Store
- **Dashboard cards use CSS classes**: Replaced ~25 inline `style={{}}` objects with semantic CSS classes (`.dashboard-card`, `.dashboard-stats-grid`, etc.)
- **Popover CSS variables**: Migrated from local `--bg-primary` etc. to shared `--dh-bg-primary` tokens
- **Input focus style**: Upgraded from subtle `border-color` change to blue ring (`box-shadow` + `border-color`) matching `--dh-focus-ring`
- **Action popover height**: Increased from 300 → 400px to accommodate NPC section

### Removed
- **Tailwind CSS infrastructure**: Removed unused `tailwindcss`, `autoprefixer`, `postcss`, and `prettier-plugin-tailwindcss` dependencies plus config files (`tailwind.config.js`, `postcss.config.js`)

## [0.8.0] - 2026-03-15

### Added
- **Vector glyph badges**: Each stat badge now renders a colored vector path glyph above the circle — heart (HP), lightning bolt (Stress), shield (Armor), star (Hope) — with the number centered inside
- **4-pass z-ordering**: Glyph paths get their own `addItems()` pass so they render consistently above circles and below text

### Changed
- **Stress glyph**: Changed from double-exclamation (‼) to lightning bolt (⚡) across badges, Party Stats dashboard, and edit popover
- **Badge circle outline**: White stroke, thicker (2px at 80% opacity) for better visibility against varied map backgrounds
- **Double-digit number sizing**: Increased reduced font ratio from 0.42 to 0.50 — numbers have more room now that glyphs are above the circle

### Removed
- **Split-text glyph rendering**: Replaced two-text-item split-point approach with single centered `buildText()` per badge. Removed `GLYPH_FONT_SCALE` and `GLYPH_SPACING` constants

## [0.7.0] - 2026-03-14

### Added
- **Stat glyphs on badges**: Each badge now shows a unicode glyph (♥ HP, ‼ Stress, ⛊ Armor, ✹ Hope) alongside the number for colorblind accessibility
- **Glyphs in UI**: Stat glyphs now appear in the right-click edit popover and Party Stats dashboard labels
- **Critical state slash overlay**: A red diagonal line renders through the badge circle when a stat is in its critical state — HP/Stress/Armor at max (fully marked), Hope at zero (fully spent)
- **Local dev manifest plugin**: Vite plugin dynamically rewrites `manifest.json` URLs to point to the local dev server (or tunnel), enabling instant local testing without GitHub Pages cache delays
- **Per-glyph font scaling**: Glyph and number are rendered as independent text items with separate font sizes — heart scaled down, shield scaled up, numbers stay consistent across all stats
- **Per-glyph spacing**: Configurable space between glyph and number per stat type

### Changed
- **Badge colors**: Replaced per-stat colored circles with uniform dark slate badges — glyphs now provide stat differentiation instead of color
- **Badge scaling**: Badges now scale proportionally with token size (clamped 16–36px), fixing overlap when tokens are shrunk to small sizes
- **Re-render on resize**: Badges now re-render when a token is resized, keeping them properly positioned and sized

### Fixed
- **Badge flickering on stat changes**: Badges no longer flicker for ALL tokens when any single token's stats change. Uses diff-based selective rendering that only updates tokens whose stats actually changed
- **Double-render on stat update**: Stat changes no longer trigger two render cycles (direct call + metadata listener). Rendering now flows exclusively through the metadata change listener
- **Badge text hidden behind circles after stat update**: Split badge rendering into two sequential `addItems()` calls (circles first, then text) so OBR's scene graph guarantees text always renders on top
- **Context menu not appearing**: Added missing `background_url` to `manifest.json` so OBR loads the background script that registers the context menu
- **Hardcoded URLs in context menu**: Replaced hardcoded `esoneill.github.io` URLs in `contextMenu.ts` with dynamically resolved base URLs using `import.meta.env.BASE_URL`, fixing broken icons and popover in the current deployment
- **Manifest URLs**: Restored absolute URLs in `manifest.json` — OBR does not resolve relative paths from manifests, causing malformed URLs (e.g. `domain.ioindex.html`)

### Added
- **CI/CD pipeline**: GitHub Actions workflow deploys to GitHub Pages automatically on push to `main`
- **Enter key to save**: Pressing Enter in any stat input field now saves and closes the popover
- **Math expressions**: Type `+2` or `-3` in the current value field and press Enter to apply the delta and save immediately
- **Compact badge display**: Stats now show as colored circle badges with numbers instead of segment bars - more compact and easier to read
- **ESLint configuration**: Added `.eslintrc.cjs` so `pnpm lint` enforces TypeScript and React rules

### Fixed
- **Duplicate listener registration**: Removed `setupContextMenu()` and `initializeRendering()` from `main.tsx` — these already run in `background.ts`. Opening the popover multiple times no longer creates duplicate scene listeners.
- **"Hide NPC stats from players" race condition**: Fixed bug where NPC bars were still visible to players due to race condition between GM and player clients both trying to manage bar shapes. Only GM now manages (creates/deletes) bar shapes.
- **Context menu save now respects hide setting**: Saving via context menu no longer bypasses the "Hide NPC stat bars" setting
- **Version mismatch**: Synchronized `package.json` version to `0.5.3` to match `manifest.json`

### Changed
- **Author updated to Arrowed**: Updated author attribution across README and package.json
- **Renamed setting to "Hide NPC stat bars"**: Clarified that the setting hides bars from the scene entirely (OBR doesn't support per-user visibility). Stats are still tracked and editable via the context menu popover.
- **Visual display**: Replaced segment bars with compact colored circle badges showing current values (HP=red, Stress=purple, Armor=gray, Hope=yellow)

### Removed
- Dead legacy segment bar constants (`SEGMENT_WIDTH`, `SEGMENT_HEIGHT`, `SEGMENT_GAP`, `BAR_GAP`, `BAR_OFFSET_Y`, `BAR_START_OFFSET`)
- Unused `DaggerheartRoomMetadata` type definition
- Unnecessary default `React` import in `StatInput.tsx`

## [0.5.1] - 2025-01-27

### Fixed
- **Stats persist after page refresh**: Added background script so bars render automatically without needing to open the dashboard
- Previously, stat bars would disappear on page refresh because rendering only happened when the dashboard popover was open

### Added
- **Hide NPC stats from players**: GM toggle to control whether players can see NPC stat bars

## [0.5.0] - 2025-01-27

### Fixed
- **Bar positioning**: Stat bars now render 25 units below the token bottom edge, avoiding overlap with OBR's name label
- **Party Stats not showing PCs**: Fixed issue where tracked tokens with visible bars wouldn't appear in Party Stats dashboard due to missing/undefined `isPC` flag
- Added `isPC` normalization in `loadTokenStats()` - infers PC status from `hope.max > 0` for legacy data

## [0.4.0] - 2025-01-26

### Fixed
- Resolved infinite loop caused by bar segment changes triggering metadata updates
- Removed `scene.items.onChange` listeners that were causing recursive refresh cycles
- Fixed token stats persistence across scene changes

## [0.3.0] - 2025-01-25

### Fixed
- Dashboard now refreshes when token names change
- Display token text label instead of asset filename
- Fixed bar flickering during updates
- Resolved infinite refresh loop causing OBR rate limit errors

## [0.2.0] - 2025-01-24

### Added
- **Party Stats Dashboard**: New action popover showing all tracked PCs at a glance
- **NPC support**: NPCs track only HP and Stress (Hope/Armor bars hidden when max=0)
- PC vs NPC toggle in the edit popover

### Changed
- Bar positioning now uses token bounds and DPI calculation (based on Owl Trackers implementation)

## [0.1.9] - 2025-01-23

### Changed
- Armor now tracks current/max values (was just max)
- Reordered bars: HP, Stress, Armor, Hope (top to bottom)
- Improved bar positioning relative to tokens

## [0.1.0] - 2025-01-22

### Added
- Initial release
- Track HP, Stress, Hope, and Armor for Daggerheart tokens
- Visual segment bars attached to tokens
- Context menu integration for adding/editing stats
- Stats persist in room metadata across sessions
- Bars visible to all players (shared items)

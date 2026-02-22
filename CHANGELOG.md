# Changelog

All notable changes to Daggerheart Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **Enter key to save**: Pressing Enter in any stat input field now saves and closes the popover
- **Math expressions**: Type `+2` or `-3` in the current value field and press Enter to apply the delta and save immediately
- **Compact badge display**: Stats now show as colored circle badges with numbers instead of segment bars - more compact and easier to read

### Fixed
- **"Hide NPC stats from players" race condition**: Fixed bug where NPC bars were still visible to players due to race condition between GM and player clients both trying to manage bar shapes. Only GM now manages (creates/deletes) bar shapes.
- **Context menu save now respects hide setting**: Saving via context menu no longer bypasses the "Hide NPC stat bars" setting

### Changed
- **Renamed setting to "Hide NPC stat bars"**: Clarified that the setting hides bars from the scene entirely (OBR doesn't support per-user visibility). Stats are still tracked and editable via the context menu popover.
- **Visual display**: Replaced segment bars with compact colored circle badges showing current values (HP=red, Stress=purple, Armor=gray, Hope=yellow)

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

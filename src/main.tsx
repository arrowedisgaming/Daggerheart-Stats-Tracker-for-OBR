import { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import { getTrackedItems } from "./itemMetadata";
import { loadTokenStats } from "./persistence";
import { loadSettings, saveSettings, isGM } from "./settings";
import { DaggerheartStats } from "./types";
import { EXTENSION_ID, GLYPHS } from "./constants";
import "./index.css";

/**
 * Main entry point for the Daggerheart Stats Tracker extension
 * This runs when the extension action popover is opened.
 * Context menu and rendering listeners are set up in background.ts,
 * which runs once when the extension loads.
 */
OBR.onReady(async () => {
  console.log("[DH] Daggerheart Stats Tracker popover opened");

  // Render the stats dashboard
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<ActionPopover />);
});

interface TokenWithStats {
  item: Item;
  stats: DaggerheartStats;
}

/**
 * Get the base URL for this extension, resolving correctly
 * in both local dev and production (GitHub Pages) environments.
 */
function getBaseUrl(): string {
  return new URL(import.meta.env.BASE_URL, window.location.href).href;
}

/**
 * Action popover component showing all tracked token stats
 */
function ActionPopover() {
  const [pcTokens, setPcTokens] = useState<TokenWithStats[]>([]);
  const [npcTokens, setNpcTokens] = useState<TokenWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGMUser, setIsGMUser] = useState(false);
  const [hideNpcStats, setHideNpcStats] = useState(false);
  const [npcExpanded, setNpcExpanded] = useState(false);

  // Load tracked tokens and settings
  const loadTokens = useCallback(async () => {
    try {
      // Load GM status and settings
      const gmStatus = await isGM();
      setIsGMUser(gmStatus);

      const settings = await loadSettings();
      setHideNpcStats(settings.hideNpcStatsFromPlayers);

      const tracked = await getTrackedItems();
      const pcs: TokenWithStats[] = [];
      const npcs: TokenWithStats[] = [];

      for (const item of tracked) {
        const stats = await loadTokenStats(item);
        if (stats) {
          if (stats.isPC) {
            pcs.push({ item, stats });
          } else {
            npcs.push({ item, stats });
          }
        }
      }

      setPcTokens(pcs);
      setNpcTokens(npcs);
    } catch (error) {
      console.error("[DH] Error loading tokens:", error);
    }
    setLoading(false);
  }, []);

  // Handle toggle for hiding NPC stats from players
  const handleToggleHideNpc = useCallback(async (checked: boolean) => {
    setHideNpcStats(checked);
    await saveSettings({ hideNpcStatsFromPlayers: checked });
  }, []);

  // Open the editing popover for a specific token
  const handleCardClick = useCallback((itemId: string) => {
    const base = getBaseUrl();
    OBR.popover.open({
      id: `${EXTENSION_ID}/context-menu`,
      url: `${base}popover.html?tokenId=${itemId}`,
      height: 320,
      width: 280,
    });
  }, []);

  // Load on mount and subscribe to changes
  useEffect(() => {
    loadTokens();

    // Refresh when room metadata changes (stats updated)
    const unsubscribe = OBR.room.onMetadataChange(() => {
      console.log("[DH] Dashboard: Stats changed, reloading tokens");
      loadTokens();
    });

    return () => unsubscribe();
  }, [loadTokens]);

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="dashboard-title">Daggerheart Stats Tracker</h1>
        <p className="dashboard-loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Party Stats</h1>

      {isGMUser && (
        <div className="dashboard-setting">
          <label htmlFor="hide-npc-toggle">
            <input
              id="hide-npc-toggle"
              type="checkbox"
              checked={hideNpcStats}
              onChange={(e) => handleToggleHideNpc(e.target.checked)}
            />
            Hide NPC stat bars
          </label>
          {hideNpcStats && (
            <p className="dashboard-setting-hint">
              NPC bars hidden from scene. Stats still tracked in popover.
            </p>
          )}
        </div>
      )}

      {pcTokens.length === 0 && npcTokens.length === 0 ? (
        <div className="dashboard-empty">
          <p>No characters tracked yet.</p>
          <p>Right-click a character token to add tracking.</p>
        </div>
      ) : (
        <div className="dashboard-token-list">
          {pcTokens.map(({ item, stats }) => (
            <TokenCard
              key={item.id}
              item={item}
              stats={stats}
              onClick={() => handleCardClick(item.id)}
            />
          ))}

          {isGMUser && npcTokens.length > 0 && (
            <>
              <div
                className="dashboard-section-header"
                onClick={() => setNpcExpanded((prev) => !prev)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setNpcExpanded((prev) => !prev)
                }
              >
                <span
                  className={`dashboard-section-toggle ${npcExpanded ? "" : "collapsed"}`}
                >
                  ▼
                </span>
                NPCs ({npcTokens.length})
              </div>
              {npcExpanded &&
                npcTokens.map(({ item, stats }) => (
                  <TokenCard
                    key={item.id}
                    item={item}
                    stats={stats}
                    isNpc
                    onClick={() => handleCardClick(item.id)}
                  />
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * A single token stats card in the dashboard
 */
function TokenCard({
  item,
  stats,
  isNpc,
  onClick,
}: {
  item: Item;
  stats: DaggerheartStats;
  isNpc?: boolean;
  onClick: () => void;
}) {
  const name =
    (item as unknown as { text?: { plainText?: string } }).text?.plainText ||
    item.name ||
    "Unnamed";

  return (
    <div
      className={`dashboard-card ${isNpc ? "dashboard-card--npc" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="dashboard-card-name">{name}</div>
      <div className="dashboard-stats-grid">
        <div>
          <span className="stat-label-hp">{GLYPHS.hp} HP:</span>{" "}
          {stats.hp.current}/{stats.hp.max}
        </div>
        <div>
          <span className="stat-label-stress">{GLYPHS.stress} Stress:</span>{" "}
          {stats.stress.current}/{stats.stress.max}
        </div>
        {stats.isPC && (
          <>
            <div>
              <span className="stat-label-armor">{GLYPHS.armor} Armor:</span>{" "}
              {stats.armor.current}/{stats.armor.max}
            </div>
            <div>
              <span className="stat-label-hope">{GLYPHS.hope} Hope:</span>{" "}
              {stats.hope.current}/{stats.hope.max}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

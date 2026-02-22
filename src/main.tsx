import { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { initializeRendering } from "./listeners";
import { getTrackedItems } from "./itemMetadata";
import { loadTokenStats } from "./persistence";
import { loadSettings, saveSettings, isGM } from "./settings";
import { DaggerheartStats } from "./types";
import "./index.css";

/**
 * Main entry point for the Daggerheart Tracker extension
 * This runs when the extension action popover is opened
 */
OBR.onReady(async () => {
  console.log("[DH] Daggerheart Tracker loaded");

  // Set up context menu
  setupContextMenu();

  // Initialize rendering and listeners
  await initializeRendering();

  // Render the stats dashboard
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(<ActionPopover />);
});

interface TokenWithStats {
  item: Item;
  stats: DaggerheartStats;
}

/**
 * Action popover component showing all PC stats
 */
function ActionPopover() {
  const [tokens, setTokens] = useState<TokenWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGMUser, setIsGMUser] = useState(false);
  const [hideNpcStats, setHideNpcStats] = useState(false);

  // Load tracked PC tokens and settings
  const loadTokens = useCallback(async () => {
    try {
      // Load GM status and settings
      const gmStatus = await isGM();
      setIsGMUser(gmStatus);

      const settings = await loadSettings();
      setHideNpcStats(settings.hideNpcStatsFromPlayers);

      const tracked = await getTrackedItems();
      const tokensWithStats: TokenWithStats[] = [];

      for (const item of tracked) {
        const stats = await loadTokenStats(item);
        if (stats && stats.isPC) {
          // Only show PCs, not NPCs
          tokensWithStats.push({ item, stats });
        }
      }

      setTokens(tokensWithStats);
    } catch (error) {
      console.error("[DH] Error loading tokens:", error);
    }
    setLoading(false);
  }, []);

  // Handle toggle for hiding NPC stats from players
  const handleToggleHideNpc = useCallback(async (checked: boolean) => {
    setHideNpcStats(checked);
    await saveSettings({ hideNpcStatsFromPlayers: checked });
    // Bars will refresh automatically via onMetadataChange handler
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
      <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "18px", marginBottom: "12px" }}>
          Daggerheart Tracker
        </h1>
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: 600 }}>
        Party Stats
      </h1>

      {isGMUser && (
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#666",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={hideNpcStats}
              onChange={(e) => handleToggleHideNpc(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Hide NPC stat bars
          </label>
          {hideNpcStats && (
            <p style={{ fontSize: "11px", color: "#999", marginTop: "4px", marginLeft: "24px" }}>
              NPC bars hidden from scene. Stats still tracked in popover.
            </p>
          )}
        </div>
      )}

      {tokens.length === 0 ? (
        <div>
          <p style={{ marginBottom: "8px", color: "#666", fontSize: "14px" }}>
            No PCs tracked yet.
          </p>
          <p style={{ color: "#666", fontSize: "13px" }}>
            Right-click a character token to add tracking.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tokens.map(({ item, stats }) => (
            <div
              key={item.id}
              style={{
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: "6px",
                  fontSize: "15px",
                }}
              >
                {(item as any).text?.plainText || item.name || "Unnamed"}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "#dc2626", fontWeight: 500 }}>HP:</span>{" "}
                  {stats.hp.current}/{stats.hp.max}
                </div>
                <div>
                  <span style={{ color: "#9333ea", fontWeight: 500 }}>
                    Stress:
                  </span>{" "}
                  {stats.stress.current}/{stats.stress.max}
                </div>
                <div>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>
                    Armor:
                  </span>{" "}
                  {stats.armor.current}/{stats.armor.max}
                </div>
                <div>
                  <span style={{ color: "#eab308", fontWeight: 500 }}>
                    Hope:
                  </span>{" "}
                  {stats.hope.current}/{stats.hope.max}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

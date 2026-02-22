import { useEffect, useState } from "react";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import { DaggerheartStats } from "../types";
import { DEFAULT_PC_STATS, EXTENSION_ID } from "../constants";
import { loadTokenStats, hasTokenStats } from "../persistence";
import { initializeTracking, updateStats, removeTracking } from "../actions";
import { StatInput } from "./StatInput";

export function Popover() {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [stats, setStats] = useState<DaggerheartStats | null>(null);
  const [isTracked, setIsTracked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when popover opens
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      try {
        // Get the currently selected items
        const selection = await OBR.player.getSelection();
        if (!selection || selection.length === 0) {
          console.log("[DH] No selection in popover");
          setIsLoading(false);
          return;
        }

        // Get the first selected item
        const items = await OBR.scene.items.getItems(selection);
        const item = items[0];
        if (!item) {
          setIsLoading(false);
          return;
        }

        setSelectedItem(item);

        // Check if already tracked
        const tracked = await hasTokenStats(item);
        setIsTracked(tracked);

        if (tracked) {
          // Load existing stats
          const existingStats = await loadTokenStats(item);
          setStats(existingStats);
        } else {
          // Show default PC stats for new tracking
          setStats({ ...DEFAULT_PC_STATS });
        }
      } catch (error) {
        console.error("[DH] Error loading popover data:", error);
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  // Handle stat changes
  const handleStatChange = (
    statKey: keyof DaggerheartStats,
    field: "current" | "max" | null,
    value: number
  ) => {
    if (!stats) return;

    setStats((prev) => {
      if (!prev) return prev;

      if (field === null) {
        // Direct value (armor, isPC)
        return { ...prev, [statKey]: value };
      } else {
        // Nested value (hp.current, stress.max, etc.)
        const stat = prev[statKey] as { current: number; max: number };
        return {
          ...prev,
          [statKey]: { ...stat, [field]: value },
        };
      }
    });
  };

  // Handle PC/NPC toggle
  const handlePCToggle = (isPC: boolean) => {
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isPC,
        hope: isPC
          ? { current: prev.hope.current || 2, max: prev.hope.max || 5 }
          : { current: 0, max: 0 },
        armor: isPC
          ? { current: prev.armor.current || 0, max: prev.armor.max || 6 }
          : { current: 0, max: 0 },
      };
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedItem || !stats) return;

    try {
      if (isTracked) {
        await updateStats(selectedItem, stats);
      } else {
        await initializeTracking(selectedItem, stats);
        setIsTracked(true);
      }

      // Close popover
      OBR.popover.close(`${EXTENSION_ID}/context-menu`);
    } catch (error) {
      console.error("[DH] Error saving stats:", error);
    }
  };

  // Remove tracking
  const handleRemove = async () => {
    if (!selectedItem) return;

    try {
      await removeTracking(selectedItem, false);
      OBR.popover.close(`${EXTENSION_ID}/context-menu`);
    } catch (error) {
      console.error("[DH] Error removing tracking:", error);
    }
  };

  if (isLoading) {
    return <div className="popover loading">Loading...</div>;
  }

  if (!selectedItem || !stats) {
    return <div className="popover error">No token selected</div>;
  }

  const tokenName = selectedItem.name || "Unnamed Token";

  return (
    <div className="popover">
      <div className="popover-header">
        <h2>{tokenName}</h2>
      </div>

      <div className="popover-body">
        {/* HP */}
        <StatInput
          label="HP"
          current={stats.hp.current}
          max={stats.hp.max}
          onCurrentChange={(v) => handleStatChange("hp", "current", v)}
          onMaxChange={(v) => handleStatChange("hp", "max", v)}
          color="red"
          onSubmit={handleSave}
        />

        {/* Stress */}
        <StatInput
          label="Stress"
          current={stats.stress.current}
          max={stats.stress.max}
          onCurrentChange={(v) => handleStatChange("stress", "current", v)}
          onMaxChange={(v) => handleStatChange("stress", "max", v)}
          color="purple"
          onSubmit={handleSave}
        />

        {/* Armor (only for PCs) */}
        {stats.isPC && (
          <StatInput
            label="Armor"
            current={stats.armor.current}
            max={stats.armor.max}
            onCurrentChange={(v) => handleStatChange("armor", "current", v)}
            onMaxChange={(v) => handleStatChange("armor", "max", v)}
            color="gray"
            onSubmit={handleSave}
          />
        )}

        {/* Hope (only for PCs) */}
        {stats.isPC && (
          <StatInput
            label="Hope"
            current={stats.hope.current}
            max={stats.hope.max}
            onCurrentChange={(v) => handleStatChange("hope", "current", v)}
            onMaxChange={(v) => handleStatChange("hope", "max", v)}
            color="yellow"
            onSubmit={handleSave}
          />
        )}

        {/* PC/NPC Toggle */}
        <div className="stat-row toggle-row">
          <label>
            <input
              type="checkbox"
              checked={!stats.isPC}
              onChange={(e) => handlePCToggle(!e.target.checked)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            NPC
          </label>
        </div>
      </div>

      <div className="popover-footer">
        <button className="btn-primary" onClick={handleSave}>
          {isTracked ? "Save" : "Add Tracking"}
        </button>
        {isTracked && (
          <button className="btn-danger" onClick={handleRemove}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

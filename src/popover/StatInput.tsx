import type { KeyboardEvent } from "react";

interface StatInputProps {
  label: string;
  current: number;
  max: number;
  onCurrentChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  color: "red" | "purple" | "yellow" | "gray";
  onSubmit?: () => void;
}

/** Derive a stable DOM id from a label like "♥ HP" → "hp" */
function labelToId(label: string): string {
  return label.replace(/[^\w]/g, "").toLowerCase();
}

export function StatInput({
  label,
  current,
  max,
  onCurrentChange,
  onMaxChange,
  color,
  onSubmit,
}: StatInputProps) {
  const baseId = labelToId(label);
  const currentId = `${baseId}-current`;
  const maxId = `${baseId}-max`;
  // Strip glyph for readable aria labels (e.g., "♥ HP" → "HP")
  const plainLabel = label.replace(/^[^\w]+/, "").trim();

  // Handle inline math (e.g., "+3", "-2") for current value, then submit
  const handleCurrentKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.currentTarget.value;

      // Apply math expression if present
      if (input.startsWith("+")) {
        const delta = parseInt(input.substring(1)) || 0;
        const newValue = Math.min(current + delta, max);
        onCurrentChange(newValue);
        e.currentTarget.value = String(newValue);
      } else if (input.startsWith("-")) {
        const delta = parseInt(input.substring(1)) || 0;
        const newValue = Math.max(current - delta, 0);
        onCurrentChange(newValue);
        e.currentTarget.value = String(newValue);
      }

      // Always submit on Enter (after applying math if applicable)
      onSubmit?.();
    }
  };

  // Submit on Enter for max value input
  const handleMaxKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit?.();
    }
  };

  // Clamp current value to 0-max range
  const handleCurrentChange = (value: number) => {
    const clamped = Math.max(0, Math.min(value, max));
    onCurrentChange(clamped);
  };

  return (
    <div className={`stat-row stat-${color}`}>
      <label htmlFor={currentId}>{label}</label>
      <div className="stat-inputs">
        <input
          id={currentId}
          type="number"
          min={0}
          max={max}
          value={current}
          onChange={(e) => handleCurrentChange(parseInt(e.target.value) || 0)}
          onKeyDown={handleCurrentKeyDown}
          className="input-current"
          aria-label={`${plainLabel} current value`}
        />
        <span className="separator">/</span>
        <input
          id={maxId}
          type="number"
          min={1}
          max={20}
          value={max}
          onChange={(e) => onMaxChange(parseInt(e.target.value) || 1)}
          onKeyDown={handleMaxKeyDown}
          className="input-max"
          aria-label={`${plainLabel} maximum value`}
        />
      </div>
    </div>
  );
}

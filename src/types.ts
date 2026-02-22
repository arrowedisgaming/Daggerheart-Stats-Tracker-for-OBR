/**
 * Core type definitions for the Daggerheart Tracker
 */

/**
 * A stat with current and maximum values
 */
export interface TrackedStat {
  current: number;
  max: number;
}

/**
 * Complete stat block for a Daggerheart character
 */
export interface DaggerheartStats {
  hp: TrackedStat;
  stress: TrackedStat;
  hope: TrackedStat;
  armor: TrackedStat;
  isPC: boolean;
}

/**
 * Room-level storage structure
 * Stored in room metadata at key "daggerheart-tracker/tokens"
 */
export interface DaggerheartRoomMetadata {
  "daggerheart-tracker/tokens": {
    [tokenKey: string]: DaggerheartStats;
  };
}

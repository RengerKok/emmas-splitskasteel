import type { ClockProgress } from './clock';
import type { UnicornProgress } from './unicorn';

export type Mode = 'tower' | 'magic' | 'treasure' | 'garden' | 'mission';
export type Level = 1 | 2 | 3;
export type OutfitCategory = 'dress' | 'shoes' | 'crown' | 'hair' | 'wand' | 'wings';

export interface Problem {
  total: number;
  known: number;
  answer: number;
  missing: 'left' | 'right';
  visual: boolean;
}

export interface OutfitItem {
  id: string;
  name: string;
  category: OutfitCategory;
  emoji: string;
  color: string;
  cost: number;
}

export interface TreasureAttempt {
  problem: Problem;
  given: number;
  xp: number;
}

export interface TreasureRound {
  completedAt: string;
  attempts: TreasureAttempt[];
}

export interface TreasureHighscore {
  correct: number;
  achievedAt: string;
}

export interface Progress {
  version: 2;
  name: string;
  xp: number;
  availableXp: number;
  clock: ClockProgress;
  unicorn: UnicornProgress;
  solved: number;
  correct: number;
  level: Level;
  selectedLevel: Level | 'auto';
  unlocked: string[];
  outfit: Partial<Record<OutfitCategory, string>>;
  tricky: number[];
  wrongByTotal: Record<string, number>;
  recentProblems: string[];
  rewardedProblems: string[];
  sound: boolean;
  timerEnabled: boolean;
  maxSeconds: number;
  treasureHighscore: TreasureHighscore | null;
  lastTreasureRound: TreasureRound | null;
  lastRewardId?: string;
}

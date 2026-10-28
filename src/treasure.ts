import type { Progress, TreasureAttempt, TreasureHighscore, TreasureRound } from './types';

export const TREASURE_SECONDS = 120;

export interface TreasureClock {
  remainingMs: number;
  deadline: number | null;
  finished: boolean;
}

export function startTreasureClock(now: number): TreasureClock {
  return { remainingMs: TREASURE_SECONDS * 1000, deadline: now + TREASURE_SECONDS * 1000, finished: false };
}

export function remainingTime(clock: TreasureClock, now: number): number {
  if (clock.finished) return 0;
  return clock.deadline === null ? clock.remainingMs : Math.max(0, clock.deadline - now);
}

export function pauseTreasureClock(clock: TreasureClock, now: number): TreasureClock {
  return { ...clock, remainingMs: remainingTime(clock, now), deadline: null };
}

export function resumeTreasureClock(clock: TreasureClock, now: number): TreasureClock {
  if (clock.finished || clock.deadline !== null) return clock;
  return { ...clock, deadline: now + clock.remainingMs };
}

export function summarizeTreasure(round: TreasureRound) {
  const correct = round.attempts.filter(({ problem, given }) => given === problem.answer).length;
  return {
    correct,
    wrong: round.attempts.length - correct,
    xp: round.attempts.reduce((sum, attempt) => sum + attempt.xp, 0),
  };
}

export function saveTreasureRound(progress: Progress, round: TreasureRound): Progress {
  const { correct } = summarizeTreasure(round);
  const best = progress.treasureHighscore;
  return {
    ...progress,
    lastTreasureRound: round,
    treasureHighscore: !best || correct > best.correct
      ? { correct, achievedAt: round.completedAt }
      : best,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isInteger(value: unknown, min: number, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function isDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}

export function readTreasureHighscore(value: unknown): TreasureHighscore | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value) || !isInteger(value.correct, 0) || !isDate(value.achievedAt)) {
    throw new Error('De highscore in het schattenboek is beschadigd.');
  }
  return { correct: value.correct, achievedAt: value.achievedAt };
}

export function readTreasureRound(value: unknown): TreasureRound | null {
  if (value === undefined || value === null) return null;
  if (!isRecord(value) || !isDate(value.completedAt) || !Array.isArray(value.attempts)) {
    throw new Error('Het schattenboek bevat een ongeldige ronde.');
  }
  const attempts = value.attempts.map((attempt: unknown): TreasureAttempt => {
    if (!isRecord(attempt) || !isRecord(attempt.problem)) {
      throw new Error('Het schattenboek bevat een ongeldige opgave.');
    }
    const { total, known, answer, missing, visual } = attempt.problem;
    if (!isInteger(total, 1, 20) || !isInteger(known, 0, total) ||
      !isInteger(answer, 0, 20) || answer !== total - known ||
      (missing !== 'left' && missing !== 'right') || typeof visual !== 'boolean' ||
      !isInteger(attempt.given, 0, 99) ||
      (attempt.xp !== 0 && attempt.xp !== 6 && attempt.xp !== 10) ||
      (attempt.given !== answer && attempt.xp !== 0)) {
      throw new Error('Het schattenboek bevat een ongeldig antwoord.');
    }
    return { problem: { total, known, answer, missing, visual }, given: attempt.given, xp: attempt.xp };
  });
  return { completedAt: value.completedAt, attempts };
}

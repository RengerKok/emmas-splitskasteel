import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultProgress, loadProgress, recordAnswer } from './game';
import TreasureResults from './TreasureResults';
import { pauseTreasureClock, remainingTime, resumeTreasureClock, saveTreasureRound, startTreasureClock, summarizeTreasure, TREASURE_SECONDS } from './treasure';
import type { Problem, TreasureRound } from './types';

const problem: Problem = { total: 17, known: 5, answer: 12, missing: 'right', visual: false };
const completedAt = '2026-10-28T19:00:00.000Z';
const round: TreasureRound = {
  completedAt,
  attempts: [
    { problem, given: 12, xp: 10 },
    { problem: { ...problem, missing: 'left' }, given: 11, xp: 0 },
    { problem: { total: 10, known: 10, answer: 0, missing: 'left', visual: true }, given: 0, xp: 6 },
  ],
};

describe('Schatkamerklok', () => {
  it('geeft precies 120 seconden, met een harde grens bij het einde', () => {
    const clock = startTreasureClock(1000);
    expect(TREASURE_SECONDS).toBe(120);
    expect(remainingTime(clock, 1000)).toBe(120000);
    expect(remainingTime(clock, 120999)).toBe(1);
    expect(remainingTime(clock, 121000)).toBe(0);
    expect(remainingTime(clock, 200000)).toBe(0);
  });

  it('bewaart de exacte resterende tijd tijdens pauze en hervat zonder tijdwinst', () => {
    const clock = startTreasureClock(0);
    const paused = pauseTreasureClock(clock, 22500);
    expect(remainingTime(paused, 1000000)).toBe(97500);
    const resumed = resumeTreasureClock(paused, 1000000);
    expect(remainingTime(resumed, 1000250)).toBe(97250);
    expect(remainingTime(resumed, 1097500)).toBe(0);
    expect(resumeTreasureClock(resumed, 1000300)).toBe(resumed);
  });

  it('laat een voltooide ronde niet hervatten', () => {
    const clock = { ...startTreasureClock(0), finished: true };
    expect(remainingTime(clock, 0)).toBe(0);
    expect(resumeTreasureClock(clock, 500)).toBe(clock);
  });
});

describe('Schattenboek en XP', () => {
  it('telt juiste, foute en nul-antwoorden en de werkelijk verdiende XP', () => {
    expect(summarizeTreasure(round)).toEqual({ correct: 2, wrong: 1, xp: 16 });
    expect(summarizeTreasure({ completedAt, attempts: [] })).toEqual({ correct: 0, wrong: 0, xp: 0 });
  });

  it('registreert fouten zonder XP-verlies en houdt lastige getallen bij', () => {
    const before = { ...defaultProgress(), xp: 100 };
    const result = recordAnswer(before, problem, 99, 0);
    expect(result.correct).toBe(false);
    expect(result.xp).toBe(0);
    expect(result.progress.xp).toBe(100);
    expect(result.progress.solved).toBe(1);
    expect(result.progress.correct).toBe(0);
    expect(result.progress.tricky).toContain(17);
    expect(result.progress.wrongByTotal['17']).toBe(1);
    expect(before.solved).toBe(0);
  });

  it('kent 10 XP zonder hint of 6 met hint toe, en beloont herhalingen niet opnieuw', () => {
    const first = recordAnswer(defaultProgress(), problem, 12, 0);
    const repeat = recordAnswer(first.progress, problem, 12, 0);
    expect(first.xp).toBe(10);
    expect(repeat.xp).toBe(0);
    expect(repeat.progress.correct).toBe(2);
    expect(repeat.progress.xp).toBe(10);
    expect(recordAnswer(defaultProgress(), problem, 12, 1).xp).toBe(6);
  });

  it('toont beide kanten, eigen antwoorden en juiste oplossingen bij fouten', () => {
    const html = renderToStaticMarkup(createElement(TreasureResults, {
      round, highscore: null, name: 'Emma', onReplay: () => {}, onHome: () => {},
    }));
    expect(html).toContain('17 = 5 + <mark>12</mark>');
    expect(html).toContain('17 = <mark>11</mark> + 5');
    expect(html).toContain('Zo klopt het: 17 = 12 + 5');
    expect(html).toContain('10 = <mark>0</mark> + 10');
    expect(html.match(/treasure-answer-good/g)).toHaveLength(2);
    expect(html.match(/treasure-answer-practice/g)).toHaveLength(1);
  });
});

describe('Koninklijke records opslaan', () => {
  it('slaat het aantal goede antwoorden en datum op, onafhankelijk van XP', () => {
    const progress = saveTreasureRound(defaultProgress(), round);
    expect(progress.treasureHighscore).toEqual({ correct: 2, achievedAt: completedAt });
    expect(progress.lastTreasureRound).toEqual(round);
    expect(progress.xp).toBe(0);
    const better = { completedAt: '2026-10-29T19:00:00.000Z', attempts: Array.from({ length: 3 }, () => ({ problem, given: 12, xp: 0 })) };
    const updated = saveTreasureRound(progress, better);
    expect(updated.treasureHighscore).toEqual({ correct: 3, achievedAt: better.completedAt });
  });

  it('behoudt het record en de oorspronkelijke datum bij lagere of gelijke score', () => {
    const progress = saveTreasureRound(defaultProgress(), round);
    const later = { ...round, completedAt: '2026-10-29T19:00:00.000Z' };
    const tied = saveTreasureRound(progress, later);
    expect(tied.treasureHighscore).toEqual(progress.treasureHighscore);
    expect(tied.lastTreasureRound).toEqual(later);
    const empty = saveTreasureRound(tied, { ...later, attempts: [] });
    expect(empty.treasureHighscore).toEqual(progress.treasureHighscore);
    expect(empty.lastTreasureRound?.attempts).toHaveLength(0);
  });

  it('maakt ook voor een lege eerste ronde een record zonder fouten te verzinnen', () => {
    expect(saveTreasureRound(defaultProgress(), { completedAt, attempts: [] }).treasureHighscore)
      .toEqual({ correct: 0, achievedAt: completedAt });
  });

  it('bewaart schattenboek, record, XP en outfit via JSON export/import en herladen', () => {
    const progress = saveTreasureRound({ ...defaultProgress(), xp: 100, unlocked: ['basic-dress', 'pink-dress'], outfit: { dress: 'pink-dress' } }, round);
    expect(loadProgress(JSON.stringify(progress))).toEqual(progress);
    expect(defaultProgress().treasureHighscore).toBeNull();
    expect(defaultProgress().lastTreasureRound).toBeNull();
  });

  it.each([30, 60, 120])('migreert oudere opslag met %i seconden naar 2 minuten zonder XP-verlies', (maxSeconds) => {
    const legacy = { ...defaultProgress(), maxSeconds, xp: 175, treasureHighscore: undefined, lastTreasureRound: undefined };
    const loaded = loadProgress(JSON.stringify(legacy));
    expect(loaded.maxSeconds).toBe(120);
    expect(loaded.xp).toBe(175);
    expect(loaded.treasureHighscore).toBeNull();
    expect(loaded.lastTreasureRound).toBeNull();
  });

  it.each([
    { correct: -1, achievedAt: completedAt },
    { correct: 2.5, achievedAt: completedAt },
    { correct: 2, achievedAt: 'geen datum' },
    { correct: '2', achievedAt: completedAt },
    [],
  ])('weigert beschadigde highscores expliciet: %j', (treasureHighscore) => {
    expect(() => loadProgress(JSON.stringify({ ...defaultProgress(), treasureHighscore }))).toThrow(/highscore/);
  });

  it.each([
    { completedAt, attempts: [null] },
    { completedAt, attempts: [{ problem: { ...problem, answer: 7 }, given: 7, xp: 10 }] },
    { completedAt, attempts: [{ problem, given: 11, xp: 10 }] },
    { completedAt, attempts: [{ problem, given: -1, xp: 0 }] },
    { completedAt, attempts: [{ problem, given: 12, xp: 100 }] },
    { completedAt: 'fout', attempts: [] },
    { completedAt, attempts: {} },
  ])('weigert beschadigde schattenboeken expliciet: %j', (lastTreasureRound) => {
    expect(() => loadProgress(JSON.stringify({ ...defaultProgress(), lastTreasureRound }))).toThrow(/schattenboek/);
  });
});

import { describe, expect, it } from 'vitest';
import { addXp, createProblem, defaultProgress, getLevel, loadProgress, makeChoices, OUTFITS, problemKey } from './game';

describe('splitsopgaven', () => {
  it('genereert steeds een correcte ontbrekende waarde binnen het niveau', () => {
    for (let n = 0; n < 100; n++) {
      const problem = createProblem(3);
      expect(problem.total).toBeGreaterThanOrEqual(1);
      expect(problem.total).toBeLessThanOrEqual(20);
      expect(problem.known).toBeGreaterThanOrEqual(0);
      expect(problem.answer).toBe(problem.total - problem.known);
      expect(problem.answer).toBeGreaterThanOrEqual(0);
      expect(problem.answer).toBeLessThanOrEqual(20);
    }
  });

  it('ondersteunt nul als ontbrekend antwoord', () => {
    const problem = createProblem(1, () => 0.99);
    expect(problem.total).toBe(10);
    expect(problem.known).toBe(10);
    expect(problem.answer).toBe(0);
  });

  it('laat beide vakjes ontbreken op basis van willekeur', () => {
    let calls = 0;
    expect(createProblem(2, () => calls++ === 2 ? 0.99 : 0.5).missing).toBe('right');
    calls = 0;
    expect(createProblem(2, () => calls++ === 2 ? 0 : 0.5).missing).toBe('left');
    expect(createProblem(2, () => 0).missing).toBe('left');
  });

  it('biedt vier unieke geldige antwoordkeuzes met precies één goed antwoord', () => {
    for (let n = 0; n < 100; n++) {
      const problem = createProblem(3);
      const choices = makeChoices(problem);
      expect(choices).toHaveLength(4);
      expect(new Set(choices).size).toBe(4);
      expect(choices.every((choice) => choice >= 0 && choice <= 20)).toBe(true);
      expect(choices.filter((choice) => choice === problem.answer)).toHaveLength(1);
    }
  });

  it('genereert binnen de grenzen van ieder niveau', () => {
    for (let n = 0; n < 100; n++) {
      expect(createProblem(1).total).toBeLessThanOrEqual(10);
      expect(createProblem(2).total).toBeLessThanOrEqual(15);
      expect(createProblem(3).total).toBeLessThanOrEqual(20);
    }
  });

  it('past automatische niveaus voorzichtig aan', () => {
    const progress = { ...defaultProgress(), solved: 5, correct: 4 };
    expect(getLevel(progress)).toBe(2);
    expect(getLevel({ ...progress, solved: 12, correct: 11 })).toBe(3);
    expect(getLevel({ ...progress, selectedLevel: 1 })).toBe(1);
  });

  it('kent XP toe en houdt ontgrendelde beloningen beschikbaar', () => {
    const first = addXp(defaultProgress(), 100);
    expect(first.unlocked).toContain('pink-dress');
    const next = addXp(first, 50);
    expect(next.unlocked).toContain('pink-dress');
    expect(OUTFITS.find((item) => item.id === 'pink-dress')?.cost).toBe(100);
    const restored = { ...defaultProgress(), xp: 0, unlocked: ['pink-dress'] };
    expect(addXp(restored, 10).unlocked).toContain('pink-dress');
  });

  it('importeert voortgang veilig en weigert beschadigde bestanden expliciet', () => {
    expect(loadProgress(JSON.stringify({ ...defaultProgress(), xp: 25 })).xp).toBe(25);
    expect(() => loadProgress('{ beschadigd')).toThrow();
    expect(() => loadProgress(JSON.stringify({ version: 1, xp: -1 }))).toThrow();
  });

  it('maakt een onderscheidende sleutel voor een beantwoorde splitsing', () => {
    expect(problemKey({ total: 17, known: 5, answer: 12, missing: 'right', visual: false })).not.toBe(
      problemKey({ total: 17, known: 5, answer: 12, missing: 'left', visual: false }),
    );
  });
});

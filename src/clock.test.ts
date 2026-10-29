import { describe, expect, it } from 'vitest';
import { categoryOf, clockChoices, clockLevel, clockTime, defaultClockProgress, dragClockHand, formatTime, handAngles, nextClockQuestion, shiftTime } from './clock';
import { addXp, completeClockMission, defaultProgress, loadProgress, recordClockAnswer } from './game';
import { buyUnicornItem, wearUnicornItem } from './unicorn';
import { UNICORN_ITEMS } from './unicorn';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import UnicornAvatar from './UnicornAvatar';
import AnalogClock from './AnalogClock';
import { chooseMission, CLOCK_JOKES, CLOCK_MISSIONS, CLOCK_PRAISE } from './clockContent';

describe('Nederlandse klok en wijzers', () => {
  it.each([[2, 0, 'twee uur'], [2, 15, 'kwart over twee'], [2, 30, 'half drie'], [2, 45, 'kwart voor drie'], [12, 30, 'half één'], [11, 45, 'kwart voor twaalf']] as const)('%i:%i heet %s', (hour, minute, expected) => {
    expect(formatTime(clockTime(hour, minute))).toBe(expected);
  });
  it.each([0, 15, 30, 45])('berekent beide wijzers bij minuut %i', (minute) => {
    expect(handAngles(clockTime(3, minute))).toEqual({ minute: minute * 6, hour: 90 + minute * 0.5 });
  });
  it('verzet kwartieren over uur- en twaalfgrenzen', () => {
    expect(shiftTime(clockTime(3), -1)).toBe(clockTime(2, 45));
    expect(shiftTime(clockTime(11, 45), 1)).toBe(clockTime(12));
    expect(shiftTime(clockTime(12), -1)).toBe(clockTime(11, 45));
  });
  it('klikt slepen vast en houdt uren synchroon', () => {
    expect(dragClockHand(clockTime(2, 45), 'minute', 359)).toBe(clockTime(3));
    expect(dragClockHand(clockTime(3), 'minute', 275)).toBe(clockTime(2, 45));
    expect(dragClockHand(clockTime(3, 15), 'hour', 157.5)).toBe(clockTime(5, 15));
  });
  it('biedt voor elke tijd vier unieke opties binnen het niveau met precies één goed antwoord', () => {
    for (const level of [1, 2, 3, 4] as const) for (let time = 0; time < 48; time++) {
      if (!['hour', 'half', 'past', 'before'].slice(0, level).includes(categoryOf(time))) continue;
      const options = clockChoices(time, level);
      expect(options).toHaveLength(4);
      expect(new Set(options.map(formatTime)).size).toBe(4);
      expect(options.filter((option) => option === time)).toHaveLength(1);
      expect(options.every((option) => ['hour', 'half', 'past', 'before'].slice(0, level).includes(categoryOf(option)))).toBe(true);
    }
    expect(clockChoices(8, 1, () => 0).indexOf(8)).not.toBe(clockChoices(8, 1, () => 0.99).indexOf(8));
  });
  it('herhaalt lastige tijden zonder buiten een vast niveau te gaan', () => {
    const progress = { ...defaultClockProgress(), selectedLevel: 4 as const, review: [11] };
    expect(nextClockQuestion(progress, -1, () => 0)).toBe(11);
    expect(categoryOf(nextClockQuestion({ ...progress, selectedLevel: 1 }, -1, () => 0))).toBe('hour');
  });
  it('oefent zwakke categorieën extra en wisselt af met bekende uren', () => {
    const progress = { ...defaultClockProgress(), selectedLevel: 4 as const };
    progress.skills.before = { attempts: 5, correct: 1, independent: 1, streak: 0 };
    const weakRandom = [0.5, 0, 0];
    expect(categoryOf(nextClockQuestion(progress, -1, () => weakRandom.shift() ?? 0))).toBe('before');
    const easyRandom = [0.9, 0, 0];
    expect(categoryOf(nextClockQuestion(progress, -1, () => easyRandom.shift() ?? 0))).toBe('hour');
  });
  it('maakt geen nieuwe tijd gelijk aan de vorige', () => {
    for (let time = 0; time < 48; time++) expect(nextClockQuestion({ ...defaultClockProgress(), selectedLevel: 4 }, time, () => 0)).not.toBe(time);
  });
  it('heeft genoeg unieke inhoud en biedt alle tien missies aan voor herhaling', () => {
    expect(new Set(CLOCK_PRAISE).size).toBeGreaterThanOrEqual(25);
    expect(new Set(CLOCK_JOKES).size).toBeGreaterThanOrEqual(20);
    expect(CLOCK_MISSIONS).toHaveLength(10);
    const counts = Array(10).fill(0);
    let previous = -1;
    for (let index = 0; index < 10; index++) {
      const selected = chooseMission(counts, previous, () => 0);
      expect(counts[selected]).toBe(0);
      counts[selected]++;
      previous = selected;
    }
    expect(counts).toEqual(Array(10).fill(1));
  });
});

describe('gedeelde XP en veilige voortgang', () => {
  it('tekent alle gekozen accessoires als echte SVG-lagen, ook na herladen', () => {
    for (const item of UNICORN_ITEMS) {
      const progress = wearUnicornItem(buyUnicornItem(addXp(defaultProgress(), 1000), item.id), item.id);
      const restored = loadProgress(JSON.stringify(progress));
      const markup = renderToStaticMarkup(createElement(UnicornAvatar, { unicorn: restored.unicorn }));
      expect(markup).toContain(`data-item="${item.id}"`);
    }
  });
  it('toont de tijd niet als antwoordtekst in de oefenklok', () => {
    const markup = renderToStaticMarkup(createElement(AnalogClock, { time: clockTime(3, 30) }));
    expect(markup).not.toContain('half vier');
    expect(markup).toContain('rotate(105deg)');
    expect(markup).toContain('rotate(180deg)');
  });
  it('telt klok-XP bij het bestaande totaal en saldo op', () => {
    const progress = recordClockAnswer(addXp(defaultProgress(), 100), 8, true, 'choice', false);
    expect(progress.xp).toBe(110);
    expect(progress.availableXp).toBe(110);
    expect(progress.clock.xp).toBe(10);
    expect(recordClockAnswer(progress, 9, true, 'setter', false).xp).toBe(125);
    expect(recordClockAnswer(progress, 9, true, 'setter', true).xp).toBe(116);
    expect(recordClockAnswer(progress, 9, false, 'setter', false).xp).toBe(110);
  });
  it('geeft niveau-XP eenmaal en bouwt automatisch op', () => {
    let progress = defaultProgress();
    for (let index = 0; index < 6; index++) progress = recordClockAnswer(progress, index * 4, true, 'choice', false);
    expect(progress.xp).toBe(100);
    expect(progress.clock.completedLevels).toEqual([1]);
    expect(clockLevel(progress.clock)).toBe(2);
    expect(recordClockAnswer(progress, 28, true, 'choice', false).xp).toBe(110);
  });
  it('kent missiebonus toe in dezelfde portemonnee', () => {
    const progress = completeClockMission(defaultProgress(), 2);
    expect(progress.availableXp).toBe(30);
    expect(progress.clock.missionCounts[2]).toBe(1);
    expect(progress.clock.missions).toBe(1);
  });
  it('weigert te dure en dubbele aankopen en behoudt prinsessenbeloningen', () => {
    const base = defaultProgress();
    expect(buyUnicornItem(base, 'saddle-purple')).toBe(base);
    const funded = addXp(base, 100);
    const bought = buyUnicornItem(funded, 'saddle-purple');
    expect(bought.availableXp).toBe(0);
    expect(bought.xp).toBe(100);
    expect(bought.unlocked).toContain('pink-dress');
    expect(buyUnicornItem(bought, 'saddle-purple')).toBe(bought);
    expect(wearUnicornItem(base, 'saddle-diamond')).toBe(base);
    const restored = loadProgress(JSON.stringify(bought));
    expect(restored.unicorn.owned).toContain('saddle-purple');
    expect(restored.unicorn.outfit.saddle).toBe('saddle-purple');
    expect(restored.unlocked).toEqual(funded.unlocked);
    expect(restored.availableXp).toBe(0);
  });
  it('migreert versie 1 zonder kleding, XP of rekengeschiedenis kwijt te raken', () => {
    const legacy = { version: 1, xp: 550, solved: 80, correct: 70, unlocked: ['basic-dress', 'diamond-crown'], outfit: { crown: 'diamond-crown' }, rewardedProblems: ['10:3:7:left'] };
    const progress = loadProgress(JSON.stringify(legacy));
    expect(progress.version).toBe(2);
    expect(progress.xp).toBe(550);
    expect(progress.availableXp).toBe(550);
    expect(progress.outfit).toEqual(legacy.outfit);
    expect(progress.unlocked).toEqual(legacy.unlocked);
    expect(progress.rewardedProblems).toEqual(legacy.rewardedProblems);
    expect(progress.solved).toBe(80);
    expect(loadProgress(JSON.stringify(progress))).toEqual(progress);
  });
  it('herstelt ongeldige nieuwe velden en weigert toekomstige versies', () => {
    const progress = loadProgress(JSON.stringify({ version: 2, xp: 100, availableXp: -5, clock: { skills: { before: { attempts: -1 } } }, unicorn: { owned: ['unknown'], outfit: { saddle: 'saddle-diamond' } } }));
    expect(progress.availableXp).toBe(0);
    expect(progress.clock.skills.before.attempts).toBe(0);
    expect(progress.unicorn.outfit.saddle).toBe('saddle-basic');
    expect(() => loadProgress(JSON.stringify({ version: 3, xp: 100 }))).toThrow();
    expect(() => loadProgress(JSON.stringify({ version: '1', xp: 100 }))).toThrow();
  });
  it('bewaart de gehele klokvoortgang in export en import', () => {
    let progress = recordClockAnswer(defaultProgress(), 11, false, 'choice', false);
    progress = recordClockAnswer(progress, 11, true, 'choice', true);
    progress = completeClockMission(progress, 8);
    expect(loadProgress(JSON.stringify(progress)).clock).toEqual(progress.clock);
    expect(progress.clock.review).toContain(11);
    expect(recordClockAnswer(progress, 11, true, 'choice', false).clock.review).not.toContain(11);
  });
});
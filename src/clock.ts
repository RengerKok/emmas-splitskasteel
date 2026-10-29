export type ClockLevel = 1 | 2 | 3 | 4;
export type ClockCategory = 'hour' | 'half' | 'past' | 'before';
export type ClockMode = 'choice' | 'setter';
export interface ClockSkill { attempts: number; correct: number; independent: number; streak: number }
export interface ClockProgress {
  selectedLevel: ClockLevel | 'auto';
  skills: Record<ClockCategory, ClockSkill>;
  review: number[];
  answered: number;
  xp: number;
  missions: number;
  missionCounts: number[];
  completedLevels: ClockLevel[];
}

export const CLOCK_LEVELS = ['Kleine Klokkenfee', 'Slimme Eenhoorn', 'Magische Tijdprinses', 'Koningin van de Tijd'];
export const CLOCK_CATEGORIES: ClockCategory[] = ['hour', 'half', 'past', 'before'];
export const CATEGORY_LABELS: Record<ClockCategory, string> = { hour: 'Hele uren', half: 'Halve uren', past: 'Kwart over', before: 'Kwart voor' };
const HOURS = ['twaalf', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];

export function normalizeTime(time: number): number { return ((Math.round(time) % 48) + 48) % 48; }
export function clockTime(hour: number, minute = 0): number { return normalizeTime(hour * 4 + minute / 15); }
export function timeParts(time: number) {
  const value = normalizeTime(time);
  return { hour: Math.floor(value / 4) || 12, minute: (value % 4) * 15 };
}
export function formatTime(time: number): string {
  const { hour, minute } = timeParts(time);
  const current = HOURS[hour % 12];
  const next = HOURS[(hour + 1) % 12];
  return minute === 0 ? `${current} uur` : minute === 15 ? `kwart over ${current}` : minute === 30 ? `half ${next}` : `kwart voor ${next}`;
}
export function handAngles(time: number) {
  const { hour, minute } = timeParts(time);
  return { minute: minute * 6, hour: (hour % 12) * 30 + minute * 0.5 };
}
export function shiftTime(time: number, quarters: number): number { return normalizeTime(time + quarters); }
export function dragClockHand(time: number, hand: 'hour' | 'minute', angle: number): number {
  const positive = ((angle % 360) + 360) % 360;
  if (hand === 'hour') return normalizeTime(Math.round(positive / 30 - (time % 4) / 4) * 4 + time % 4);
  const next = Math.round(positive / 90) % 4;
  let delta = next - time % 4;
  if (delta > 2) delta -= 4;
  if (delta < -2) delta += 4;
  return shiftTime(time, delta);
}
export function categoryOf(time: number): ClockCategory { return (['hour', 'past', 'half', 'before'] as const)[normalizeTime(time) % 4]; }
export function categoriesFor(level: ClockLevel) { return CLOCK_CATEGORIES.slice(0, level); }
export function skillMastered(skill: ClockSkill): boolean {
  return skill.independent >= 6 && skill.streak >= 3 && skill.correct / Math.max(1, skill.attempts) >= 0.75;
}
export function clockLevel(progress: ClockProgress): ClockLevel {
  if (progress.selectedLevel !== 'auto') return progress.selectedLevel;
  const first = CLOCK_CATEGORIES.findIndex((category) => !skillMastered(progress.skills[category]));
  return (first === -1 ? 4 : first + 1) as ClockLevel;
}
export function defaultClockProgress(): ClockProgress {
  const empty = (): ClockSkill => ({ attempts: 0, correct: 0, independent: 0, streak: 0 });
  return { selectedLevel: 'auto', skills: { hour: empty(), half: empty(), past: empty(), before: empty() }, review: [], answered: 0, xp: 0, missions: 0, missionCounts: Array(10).fill(0), completedLevels: [] };
}
export function clockChoices(answer: number, level: ClockLevel, random = Math.random): number[] {
  const allowed = categoriesFor(level);
  const candidates = [answer, answer - 4, answer + 4, Math.floor(answer / 4) * 4, answer - 1, answer + 1, answer + 2, answer + 8, answer - 8];
  const unique = [...new Set(candidates.map(normalizeTime))].filter((time) => allowed.includes(categoryOf(time))).slice(0, 4);
  for (let index = unique.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [unique[index], unique[swap]] = [unique[swap], unique[index]];
  }
  return unique;
}
export function nextClockQuestion(progress: ClockProgress, previous = -1, random = Math.random): number {
  const categories = categoriesFor(clockLevel(progress));
  const review = progress.review.filter((time) => time !== previous && categories.includes(categoryOf(time)));
  const roll = random();
  if (review.length && roll < 0.35) return review[Math.floor(random() * review.length)];
  const weak = categories.filter((category) => {
    const skill = progress.skills[category];
    return skill.attempts >= 3 && skill.correct / skill.attempts < 0.75;
  });
  const pool = weak.length && roll < 0.65 ? weak : categories;
  const selected = pool[Math.floor(random() * pool.length)];
  const times = Array.from({ length: 48 }, (_, index) => index).filter((time) => time !== previous && categoryOf(time) === selected);
  return times[Math.floor(random() * times.length)];
}
export function clockTip(time: number): string {
  const { hour, minute } = timeParts(time);
  if (minute === 0) return 'De lange blauwe wijzer staat op 12: een heel uur. De korte roze wijzer vertelt welk uur.';
  if (minute === 15) return 'De lange blauwe wijzer staat bij kwart over op 3. De korte roze wijzer is net voorbij het uur.';
  if (minute === 30) return `Bij half staat de lange blauwe wijzer op 6. De korte roze wijzer staat halverwege ${HOURS[hour % 12]} en ${HOURS[(hour + 1) % 12]}. We noemen het volgende uur!`;
  return 'Bij kwart voor staat de lange blauwe wijzer op 9. De korte roze wijzer is bijna bij het volgende uur. Dat uur noemen we!';
}
export function readClockProgress(value: unknown): ClockProgress {
  const base = defaultClockProgress();
  if (!value || typeof value !== 'object') return base;
  const data = value as Partial<ClockProgress>;
  const count = (number: unknown) => typeof number === 'number' && Number.isSafeInteger(number) && number >= 0 ? number : 0;
  for (const category of CLOCK_CATEGORIES) {
    const skill = data.skills?.[category];
    const attempts = count(skill?.attempts);
    const correct = Math.min(attempts, count(skill?.correct));
    base.skills[category] = { attempts, correct, independent: Math.min(correct, count(skill?.independent)), streak: Math.min(correct, count(skill?.streak)) };
  }
  return { ...base,
    selectedLevel: [1, 2, 3, 4].includes(Number(data.selectedLevel)) ? Number(data.selectedLevel) as ClockLevel : 'auto',
    answered: count(data.answered), xp: count(data.xp), missions: count(data.missions),
    review: Array.isArray(data.review) ? [...new Set(data.review.filter((time) => Number.isInteger(time) && time >= 0 && time < 48))].slice(-24) : [],
    missionCounts: base.missionCounts.map((_, index) => count(data.missionCounts?.[index])),
    completedLevels: Array.isArray(data.completedLevels) ? [...new Set(data.completedLevels.filter((level) => [1, 2, 3, 4].includes(level)))] : [],
  };
}
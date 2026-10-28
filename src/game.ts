import type { Level, OutfitItem, Problem, Progress } from './types';

export const STORAGE_KEY = 'emmas-magische-splitskasteel-v1';

export const OUTFITS: OutfitItem[] = [
  { id: 'basic-dress', name: 'Lila droomjurk', category: 'dress', emoji: '👗', color: '#b983e8', cost: 0 },
  { id: 'sparkle-shoes', name: 'Glitterschoenen', category: 'shoes', emoji: '👠', color: '#f5bc50', cost: 50 },
  { id: 'pink-dress', name: 'Roze prinsessenjurk', category: 'dress', emoji: '👗', color: '#fb8abd', cost: 100 },
  { id: 'gold-crown', name: 'Gouden kroontje', category: 'crown', emoji: '👑', color: '#ffcb53', cost: 150 },
  { id: 'magic-wand', name: 'Toverstaf', category: 'wand', emoji: '🪄', color: '#8f62d2', cost: 225 },
  { id: 'rainbow-dress', name: 'Regenboogjurk', category: 'dress', emoji: '🌈', color: '#63c8bb', cost: 300 },
  { id: 'butterfly-wings', name: 'Vlindervleugels', category: 'wings', emoji: '🦋', color: '#75d9d2', cost: 400 },
  { id: 'diamond-crown', name: 'Diamanten kroon', category: 'crown', emoji: '💎', color: '#69c5df', cost: 550 },
  { id: 'royal-gown', name: 'Koninklijke baljurk', category: 'dress', emoji: '✨', color: '#f0a7d2', cost: 750 },
  { id: 'queen-outfit', name: 'Magische koninginoutfit', category: 'wings', emoji: '🧚', color: '#a285e5', cost: 1000 },
  { id: 'flower-clip', name: 'Bloemenhaarspeld', category: 'hair', emoji: '🌸', color: '#f281ad', cost: 125 },
];

export const JOKES = [
  'Waarom nam de prinses een ladder mee naar school? Om naar de hoogste klas te gaan!',
  'Wat zegt een toverstaf als hij moe is? Ik ben helemaal uitge-toverd!',
  'Waarom ging de eenhoorn naar de kapper? Voor een nieuwe pony!',
  'Waarom kon de prinses haar computer niet vinden? Hij zat achter het toetsenbord!',
  'Wat eet een draak als ontbijt? Vuurvlokken!',
  'Waarom is een prinses goed in rekenen? Ze telt op haar vingers én haar kroon!',
  'Wat zegt een kikker in het kasteel? Kroon op, daar kom ik!',
  'Hoe noem je een slapende draak? Een snurk-draak!',
  'Waarom nam de fee een paraplu mee? Voor een beetje toverslag!',
  'Wat draagt een sneeuwpop naar het bal? Een smeltpak!',
  'Wat is het lievelingsspel van een eenhoorn? Paard-opoly!',
  'Waarom kan een kroon goed luisteren? Hij staat altijd bovenop!',
  'Wat zegt een bloem tegen de zon? Jij laat me stralen!',
  'Waarom ging de prinses op de klok zitten? Dan had ze alle tijd!',
  'Hoe noem je een konijn met een kroon? Een koninklijk huppeltje!',
  'Wat doet een draak bij de bakker? Een vuurtje opstoken voor de broodjes!',
  'Waarom was de tovenaar zo goed in tellen? Hij had alles op een rijtje getoverd!',
  'Wat zegt een ster als ze valt? Oeps, ik schitter even ergens anders!',
  'Waarom danst de prinses zo graag? Omdat haar voeten de maat weten!',
  'Wat zegt een kasteelmuur tegen de andere? Ik zie je straks om de hoek!',
  'Waarom ging de fee naar de bibliotheek? Ze zocht een betoverend boek!',
  'Wat is het favoriete snoep van een prinses? Kroonjuwelen-drop!',
  'Waarom is een regenboog nooit verdrietig? Hij heeft altijd kleur!',
  'Hoe noemt een draak zijn lievelingsknuffel? Mijn vuurvriendje!',
  'Wat zegt de eenhoorn na een rekensom? Hinnik, dat klopt!',
  'Waarom nam de koning een potlood mee? Om zijn koninkrijk uit te tekenen!',
  'Wat doet een prinses als haar schoen loszit? Ze maakt er een sprookjesstrik in!',
  'Waarom zijn sterren zo goede vriendinnen? Ze laten elkaar stralen!',
  'Wat zei de appel in de tuin? Ik ben om op te eten!',
  'Hoe groet een magische kat? Miauw-gisch je te zien!',
];

export const PRAISE = [
  'Wauw Emma, jij bent een echte rekenprinses!',
  'Wat ben jij goed bezig! ✨',
  'De eenhoorns zijn trots op jou!',
  'Fantastisch! Je toverstaf wordt steeds krachtiger!',
  'Jij hebt echte prinsessenhersens!',
  'Superknap! Je hebt weer een raadsel opgelost!',
  'Wat fijn dat je blijft proberen!',
  'Elke poging maakt jou een beetje sterker!',
  'Je hebt dit helemaal zelf uitgezocht. Hoera!',
];

export function createProblem(
  level: Level,
  random: () => number = Math.random,
  visual = false,
): Problem {
  const max = level === 1 ? 10 : level === 2 ? 15 : 20;
  const min = level === 1 ? 1 : 2;
  const total = min + Math.floor(random() * (max - min + 1));
  const known = Math.floor(random() * (total + 1));
  const missing = random() < 0.5 ? 'left' : 'right';
  return { total, known, answer: total - known, missing, visual };
}

export function makeChoices(problem: Problem, random: () => number = Math.random): number[] {
  const answer = problem.answer;
  const candidates = new Set<number>([answer]);
  const offsets = [-3, -2, -1, 1, 2, 3, 4, -4, 5, -5];
  for (const offset of offsets) {
    const option = answer + offset;
    if (option >= 0 && option <= 20 && candidates.size < 4) candidates.add(option);
  }
  while (candidates.size < 4) {
    candidates.add(Math.floor(random() * 21));
  }
  const options = [...candidates];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export function getLevel(progress: Progress): Level {
  if (progress.selectedLevel !== 'auto') return progress.selectedLevel;
  if (progress.solved >= 12 && progress.correct / Math.max(progress.solved, 1) >= 0.82) return 3;
  if (progress.solved >= 5 && progress.correct / Math.max(progress.solved, 1) >= 0.65) return 2;
  return 1;
}

export function addXp(progress: Progress, amount: number): Progress {
  const before = new Set(progress.unlocked);
  const xp = progress.xp + amount;
  const unlocked = [...new Set([
    ...progress.unlocked,
    ...OUTFITS.filter((item) => item.cost <= xp).map((item) => item.id),
  ])];
  const reward = unlocked.find((id) => !before.has(id));
  return { ...progress, xp, unlocked, ...(reward ? { lastRewardId: reward } : {}) };
}

export function defaultProgress(): Progress {
  return {
    version: 1,
    name: 'Emma',
    xp: 0,
    solved: 0,
    correct: 0,
    level: 1,
    selectedLevel: 'auto',
    unlocked: ['basic-dress'],
    outfit: { dress: 'basic-dress' },
    tricky: [],
    wrongByTotal: {},
    recentProblems: [],
    rewardedProblems: [],
    sound: true,
    timerEnabled: true,
    maxSeconds: 60,
  };
}

export function loadProgress(raw: string | null): Progress {
  if (!raw) return defaultProgress();
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || (parsed as { version?: unknown }).version !== 1) {
    throw new Error('Dit voortgangsbestand is niet geldig of wordt niet ondersteund.');
  }
  const base = defaultProgress();
  const data = parsed as Partial<Progress>;
  if (typeof data.xp !== 'number' || data.xp < 0 || !Number.isFinite(data.xp)) {
    throw new Error('De voortgang bevat een ongeldig XP-aantal.');
  }
  return {
    ...base,
    ...data,
    name: typeof data.name === 'string' && data.name.trim() ? data.name.slice(0, 20) : base.name,
    unlocked: Array.isArray(data.unlocked) ? data.unlocked.filter((id) => OUTFITS.some((item) => item.id === id)) : base.unlocked,
    outfit: data.outfit && typeof data.outfit === 'object' ? data.outfit : base.outfit,
    tricky: Array.isArray(data.tricky) ? data.tricky.filter((n) => Number.isInteger(n) && n >= 1 && n <= 20) : [],
    wrongByTotal: data.wrongByTotal && typeof data.wrongByTotal === 'object' ? data.wrongByTotal : {},
    recentProblems: Array.isArray(data.recentProblems) ? data.recentProblems.filter((key) => typeof key === 'string').slice(-20) : [],
    rewardedProblems: Array.isArray(data.rewardedProblems) ? data.rewardedProblems.filter((key) => typeof key === 'string') : [],
    selectedLevel: data.selectedLevel === 1 || data.selectedLevel === 2 || data.selectedLevel === 3 ? data.selectedLevel : 'auto',
    level: data.level === 2 || data.level === 3 ? data.level : 1,
    maxSeconds: data.maxSeconds === 30 || data.maxSeconds === 60 || data.maxSeconds === 120 ? data.maxSeconds : 60,
    sound: typeof data.sound === 'boolean' ? data.sound : true,
    timerEnabled: typeof data.timerEnabled === 'boolean' ? data.timerEnabled : true,
  };
}

export function problemKey(problem: Problem): string {
  return `${problem.total}:${problem.known}:${problem.answer}:${problem.missing}`;
}

export function nextJoke(previous?: string): string {
  const available = JOKES.filter((joke) => joke !== previous);
  return available[Math.floor(Math.random() * available.length)] ?? JOKES[0];
}

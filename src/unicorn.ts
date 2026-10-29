import type { Progress } from './types';

export type UnicornKind = 'luna' | 'star' | 'rainbow';
export type UnicornSlot = 'saddle' | 'head' | 'wings' | 'shoes' | 'decoration' | 'garland' | 'bells' | 'mane' | 'tail' | 'background';
export interface UnicornItem { id: string; name: string; slot: UnicornSlot; cost: number; color: string }
export interface UnicornProgress { kind: UnicornKind | null; name: string; owned: string[]; outfit: Partial<Record<UnicornSlot, string>> }
export const UNICORNS: { id: UnicornKind; name: string; color: string }[] = [
  { id: 'luna', name: 'Luna', color: '#fffaf4' }, { id: 'star', name: 'Sterretje', color: '#ffcfdf' }, { id: 'rainbow', name: 'Regenboog', color: '#e1d5ff' },
];
export const UNICORN_ITEMS: UnicornItem[] = [
  { id: 'saddle-basic', name: 'Roze zadel', slot: 'saddle', cost: 0, color: '#ed83ad' },
  { id: 'saddle-purple', name: 'Paars zadel', slot: 'saddle', cost: 100, color: '#a278cf' },
  { id: 'saddle-rainbow', name: 'Regenboogzadel', slot: 'saddle', cost: 300, color: '#66c4b4' },
  { id: 'saddle-gold', name: 'Gouden zadel', slot: 'saddle', cost: 450, color: '#eabd49' },
  { id: 'saddle-diamond', name: 'Diamantenzadel', slot: 'saddle', cost: 800, color: '#8bdded' },
  { id: 'saddle-stars', name: 'Sterrenzadel', slot: 'saddle', cost: 250, color: '#5774b9' },
  { id: 'head-basic', name: 'Madeliefje', slot: 'head', cost: 0, color: '#fff6b0' },
  { id: 'head-bow', name: 'Magische roze strik', slot: 'head', cost: 50, color: '#f185b9' },
  { id: 'head-flowers', name: 'Bloemenkrans', slot: 'head', cost: 150, color: '#ef97b5' },
  { id: 'head-crown', name: 'Kroontje', slot: 'head', cost: 250, color: '#f7cd53' },
  { id: 'head-bridle', name: 'Gouden hoofdstel', slot: 'head', cost: 400, color: '#dbb43e' },
  { id: 'head-stars', name: 'Sterrenhaarband', slot: 'head', cost: 175, color: '#ffda6c' },
  { id: 'wings-butterfly', name: 'Vlindervleugels', slot: 'wings', cost: 600, color: '#ee9fc9' },
  { id: 'wings-rainbow', name: 'Magische regenboogvleugels', slot: 'wings', cost: 1000, color: '#73cdc5' },
  { id: 'shoes-glitter', name: 'Roze glitterschoenen', slot: 'shoes', cost: 200, color: '#f287b3' },
  { id: 'decoration-mane', name: 'Betoverde manendecoratie', slot: 'decoration', cost: 175, color: '#8edbe1' },
  { id: 'garland-stars', name: 'Sterrenslinger', slot: 'garland', cost: 275, color: '#fbd36d' },
  { id: 'bells-magic', name: 'Magische belletjes', slot: 'bells', cost: 125, color: '#f2be4c' },
  { id: 'mane-pink', name: 'Roze manen', slot: 'mane', cost: 0, color: '#ec9abb' },
  { id: 'mane-mint', name: 'Mintgroene manen', slot: 'mane', cost: 75, color: '#69c5af' },
  { id: 'mane-blue', name: 'Hemelsblauwe manen', slot: 'mane', cost: 75, color: '#7ebde6' },
  { id: 'tail-pink', name: 'Roze staart', slot: 'tail', cost: 0, color: '#ec9abb' },
  { id: 'tail-mint', name: 'Mintgroene staart', slot: 'tail', cost: 75, color: '#69c5af' },
  { id: 'tail-lilac', name: 'Lila staart', slot: 'tail', cost: 75, color: '#b7a0e3' },
  { id: 'background-meadow', name: 'Bloemenweide', slot: 'background', cost: 0, color: '#daefe2' },
  { id: 'background-sunset', name: 'Roze avondlucht', slot: 'background', cost: 125, color: '#ffe0d9' },
  { id: 'background-stars', name: 'Sterrenhemel', slot: 'background', cost: 150, color: '#d8def9' },
];
export function defaultUnicorn(): UnicornProgress {
  const free = UNICORN_ITEMS.filter((item) => item.cost === 0);
  return { kind: null, name: '', owned: free.map((item) => item.id), outfit: Object.fromEntries(free.map((item) => [item.slot, item.id])) };
}
export function readUnicorn(value: unknown): UnicornProgress {
  const base = defaultUnicorn();
  if (!value || typeof value !== 'object') return base;
  const data = value as Partial<UnicornProgress>;
  const owned = [...new Set([...base.owned, ...(Array.isArray(data.owned) ? data.owned.filter((id) => UNICORN_ITEMS.some((item) => item.id === id)) : [])])];
  const outfit = { ...base.outfit };
  if (data.outfit && typeof data.outfit === 'object') {
    for (const item of UNICORN_ITEMS) if (data.outfit[item.slot] === item.id && owned.includes(item.id)) outfit[item.slot] = item.id;
  }
  return { kind: UNICORNS.some((kind) => kind.id === data.kind) ? data.kind! : null, name: typeof data.name === 'string' ? data.name.slice(0, 24) : '', owned, outfit };
}
export function buyUnicornItem(progress: Progress, id: string): Progress {
  const item = UNICORN_ITEMS.find((candidate) => candidate.id === id);
  if (!item || progress.unicorn.owned.includes(id) || progress.availableXp < item.cost) return progress;
  return { ...progress, availableXp: progress.availableXp - item.cost, unicorn: { ...progress.unicorn, owned: [...progress.unicorn.owned, id], outfit: { ...progress.unicorn.outfit, [item.slot]: id } } };
}
export function wearUnicornItem(progress: Progress, id: string): Progress {
  const item = UNICORN_ITEMS.find((candidate) => candidate.id === id);
  if (!item || !progress.unicorn.owned.includes(id)) return progress;
  return { ...progress, unicorn: { ...progress.unicorn, outfit: { ...progress.unicorn.outfit, [item.slot]: id } } };
}
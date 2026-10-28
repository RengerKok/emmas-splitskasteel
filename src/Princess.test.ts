import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Princess from './Princess';
import OutfitArt from './OutfitArt';
import { defaultProgress, loadProgress, OUTFITS } from './game';
import type { OutfitCategory } from './types';

describe('Prinses en garderobe', () => {
  it('toont de basisjurk zonder vrijgespeelde accessoires', () => {
    const html = renderToStaticMarkup(createElement(Princess, { outfit: {} }));
    expect(html).toContain('data-outfit-id="basic-dress"');
    expect(html).not.toContain('data-outfit-id="gold-crown"');
    expect(html).toContain('radialGradient');
    expect(html).toContain('aria-label="Emma&#x27;s prinses"');
  });

  it.each(OUTFITS)('gebruikt de illustratie van $name zowel los als op de prinses', (item) => {
    const html = renderToStaticMarkup(createElement(Princess, { outfit: { [item.category]: item.id } }));
    const preview = renderToStaticMarkup(createElement(OutfitArt, { item }));
    expect(html).toContain(`data-outfit-id="${item.id}"`);
    expect(preview).toContain(`data-outfit-id="${item.id}"`);
    expect(preview).toContain(`aria-label="${item.name}"`);
    expect(preview).not.toContain('<text');
    expect(preview).not.toContain('<image');
    if (item.category === 'dress' && item.id !== 'basic-dress') {
      expect(html).not.toContain('data-outfit-id="basic-dress"');
    }
  });

  it('toont alle zes categorieen samen en bewaart de gekozen outfit na herladen', () => {
    const outfit: Partial<Record<OutfitCategory, string>> = {
      dress: 'royal-gown', shoes: 'sparkle-shoes', crown: 'diamond-crown',
      hair: 'flower-clip', wings: 'queen-outfit', wand: 'magic-wand',
    };
    const saved = loadProgress(JSON.stringify({ ...defaultProgress(), xp: 1000, unlocked: OUTFITS.map((item) => item.id), outfit }));
    expect(saved.outfit).toEqual(outfit);
    const html = renderToStaticMarkup(createElement(Princess, { outfit: saved.outfit }));
    for (const id of Object.values(outfit)) expect(html).toContain(`data-outfit-id="${id}"`);
    expect(html.match(/data-outfit-id=/g)).toHaveLength(6);
  });

  it('plaatst de jurk over de schouders en behoudt de hoogte van de zoom', () => {
    const html = renderToStaticMarkup(createElement(Princess, { outfit: { dress: 'pink-dress' } }));
    expect(html).toContain('x="49" y="140" width="202" height="251"');
    expect(140 + 251).toBe(391);
  });

  it('houdt SVG-verlopen uniek bij meerdere prinsessen en alle beloningen op een pagina', () => {
    const html = renderToStaticMarkup(createElement(Fragment, null,
      createElement(Princess, { outfit: { dress: 'rainbow-dress', crown: 'diamond-crown', wings: 'queen-outfit' } }),
      createElement(Princess, { outfit: { dress: 'pink-dress' }, small: true }),
      ...OUTFITS.map((item) => createElement(OutfitArt, { item, key: item.id })),
    ));
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const references = [...html.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1]);
    expect(references.length).toBeGreaterThan(30);
    for (const id of references) expect(ids).toContain(id);
  });

  it('geeft de verschillende jurken en kronen een eigen ontwerp, niet alleen een andere kleur', () => {
    const silhouette = (id: string) => {
      const item = OUTFITS.find((entry) => entry.id === id);
      if (!item) throw new Error(`Onbekende testoutfit: ${id}`);
      const html = renderToStaticMarkup(createElement(OutfitArt, { item }));
      return [...html.matchAll(/\sd="([^"]+)"/g)].map((match) => match[1]).join('|');
    };
    const dresses = OUTFITS.filter((item) => item.category === 'dress').map((item) => silhouette(item.id));
    expect(new Set(dresses).size).toBe(dresses.length);
    expect(silhouette('gold-crown')).not.toBe(silhouette('diamond-crown'));
    expect(silhouette('butterfly-wings')).not.toBe(silhouette('queen-outfit'));
  });
});

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Progress } from './types';
import UnicornAvatar from './UnicornAvatar';
import { buyUnicornItem, UNICORN_ITEMS, UNICORNS, wearUnicornItem } from './unicorn';
import type { UnicornKind, UnicornSlot } from './unicorn';

const SLOTS: { id: UnicornSlot; title: string }[] = [
  { id: 'saddle', title: 'Zadels' }, { id: 'head', title: 'Op het hoofd' }, { id: 'wings', title: 'Vleugels' },
  { id: 'shoes', title: 'Glitterschoenen' }, { id: 'decoration', title: 'Manendecoratie' },
  { id: 'garland', title: 'Sterrenslinger' }, { id: 'bells', title: 'Belletjes' },
  { id: 'mane', title: 'Kleur van de manen' }, { id: 'tail', title: 'Kleur van de staart' }, { id: 'background', title: 'Achtergrond' },
];

export default function UnicornStable({ progress, setProgress }: { progress: Progress; setProgress: Dispatch<SetStateAction<Progress>> }) {
  const [slot, setSlot] = useState<UnicornSlot>('saddle');
  const [message, setMessage] = useState('');
  const [care, setCare] = useState('');
  const [choosing, setChoosing] = useState(!progress.unicorn.kind);
  const unicorn = progress.unicorn;

  function choose(kind: UnicornKind) {
    setProgress((current) => ({ ...current, unicorn: { ...current.unicorn, kind, name: current.unicorn.name || UNICORNS.find((entry) => entry.id === kind)!.name } }));
    setChoosing(false);
  }

  return <section className="unicorn-stable">
    <h1>Mijn Magische Eenhoornstal</h1>
    {choosing ? <><h2>Wie wordt jouw vriendje?</h2><div className="unicorn-choices">{UNICORNS.map((kind) => <button key={kind.id} className="unicorn-pick" onClick={() => choose(kind.id)}>
      <UnicornAvatar unicorn={{ ...unicorn, kind: kind.id, name: kind.name }} /><strong>{kind.name}</strong>
    </button>)}</div></> : <div className="stable-layout">
      <div className="stable-stage">
        <UnicornAvatar unicorn={unicorn} celebrate={Boolean(care)} />
        <label className="unicorn-name">Naam van je eenhoorn<input maxLength={24} value={unicorn.name} onChange={(event) => setProgress((current) => ({ ...current, unicorn: { ...current.unicorn, name: event.target.value } }))} onBlur={() => {
          if (!unicorn.name.trim()) setProgress((current) => ({ ...current, unicorn: { ...current.unicorn, name: UNICORNS.find((kind) => kind.id === current.unicorn.kind)?.name ?? 'Luna' } }));
        }} /></label>
        <div className="button-row care-buttons"><button className="secondary-button" onClick={() => setCare(`${unicorn.name} smult van een knapperige appel!`)}>🍎 Geef een appel</button><button className="secondary-button" onClick={() => setCare(`${unicorn.name} heeft weer zachte, glanzende manen!`)}>🪮 Borstel de manen</button></div>
        <p className="care-message" role="status">{care}</p>
        <button className="hint-button" onClick={() => { setChoosing(true); setCare(''); }}>Andere eenhoorn kiezen</button>
      </div>
      <div className="stable-shop">
        <div className="shop-heading"><h2>Het eenhoornatelier</h2><strong>{progress.availableXp} XP beschikbaar</strong></div>
        <label className="shop-category">Kies iets moois<select value={slot} onChange={(event) => { setSlot(event.target.value as UnicornSlot); setMessage(''); }}>{SLOTS.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label>
        <div className="unicorn-shop-grid">{UNICORN_ITEMS.filter((item) => item.slot === slot).map((item) => {
          const owned = unicorn.owned.includes(item.id);
          const selected = unicorn.outfit[slot] === item.id;
          const affordable = progress.availableXp >= item.cost;
          return <button key={item.id} className={`unicorn-shop-item ${selected ? 'selected' : ''}`} aria-pressed={selected} disabled={!owned && !affordable}
            aria-label={`${item.name}, ${selected ? 'aangetrokken' : owned ? 'trek aan' : `kopen voor ${item.cost} XP`}`} onClick={() => {
              setProgress((current) => owned ? wearUnicornItem(current, item.id) : buyUnicornItem(current, item.id));
              setMessage(owned ? `${item.name} aangetrokken!` : `${item.name} gekocht en aangetrokken!`);
            }}>
            {slot === 'mane' || slot === 'tail' || slot === 'background' ? <span className="unicorn-swatch" style={{ background: item.color }} /> : <UnicornAvatar unicorn={{ ...unicorn, outfit: { ...unicorn.outfit, [slot]: item.id } }} scenery={false} />}
            <strong>{item.name}</strong><span>{selected ? '✓ Aangetrokken' : owned ? 'Trek aan' : `${item.cost} XP`}</span>
            {!owned && !affordable && <small>Nog {item.cost - progress.availableXp} XP</small>}
          </button>;
        })}</div>
        {['wings', 'shoes', 'decoration', 'garland', 'bells'].includes(slot) && unicorn.outfit[slot] && <button className="hint-button" onClick={() => setProgress((current) => ({ ...current, unicorn: { ...current.unicorn, outfit: { ...current.unicorn.outfit, [slot]: undefined } } }))}>Doe dit accessoire af</button>}
        <p className="shop-message" role="status">{message}</p>
      </div>
    </div>}
  </section>;
}
import type { OutfitCategory } from './types';
import { OUTFITS } from './game';

interface Props {
  outfit: Partial<Record<OutfitCategory, string>>;
  small?: boolean;
}

export default function Princess({ outfit, small = false }: Props) {
  const selected = (category: OutfitCategory) => OUTFITS.find((item) => item.id === outfit[category]);
  const dress = selected('dress');
  const crown = selected('crown');
  const hair = selected('hair');
  const wings = selected('wings');
  const shoes = selected('shoes');
  const wand = selected('wand');
  return (
    <svg className={`princess ${small ? 'princess-small' : ''}`} viewBox="0 0 220 280" role="img" aria-label="Emma's prinses">
      {wings && <g fill={wings.color} opacity=".7"><ellipse cx="57" cy="158" rx="35" ry="57" /><ellipse cx="163" cy="158" rx="35" ry="57" /></g>}
      <path d="M75 98 Q43 132 62 205 L158 205 Q177 132 145 98Z" fill="#6c3e30" />
      <circle cx="110" cy="83" r="44" fill="#ffd7b1" />
      <path d="M67 83 Q64 31 109 33 Q157 30 154 87 Q132 60 105 63 Q85 63 67 83Z" fill="#76442f" />
      <path d="M96 84h4m24 0h4" stroke="#573830" strokeWidth="5" strokeLinecap="round" />
      <path d="M101 103 Q110 112 120 103" fill="none" stroke="#e26d79" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="98" r="7" fill="#f3a5a1" opacity=".7" /><circle cx="140" cy="98" r="7" fill="#f3a5a1" opacity=".7" />
      {crown && <path d="M77 55 L83 30 L99 46 L110 22 L123 46 L140 30 L145 58Z" fill={crown.color} stroke="#fff1a4" strokeWidth="3" />}
      {hair && <text x="147" y="52" fontSize="27">{hair.emoji}</text>}
      {dress ? <path d="M88 128 Q110 140 132 128 L165 221 Q110 246 55 221Z" fill={dress.color} stroke="#fff" strokeWidth="4" /> : <path d="M88 128 Q110 140 132 128 L165 221 Q110 246 55 221Z" fill="#b983e8" />}
      <path d="M88 132 Q110 152 132 132" fill="none" stroke="#fff4d8" strokeWidth="5" />
      {shoes && <g fill={shoes.color}><ellipse cx="83" cy="237" rx="19" ry="10" /><ellipse cx="137" cy="237" rx="19" ry="10" /></g>}
      {wand && <g transform="rotate(-28 173 169)"><rect x="169" y="150" width="7" height="70" rx="3" fill="#9c6138" /><path d="M172 133 L178 146 L192 148 L182 158 L184 172 L172 165 L160 172 L162 158 L152 148 L166 146Z" fill="#ffd45c" /></g>}
      <circle cx="78" cy="171" r="5" fill="#fff" opacity=".65" /><circle cx="149" cy="191" r="4" fill="#fff" opacity=".75" />
    </svg>
  );
}

import { useId } from 'react';
import type { OutfitCategory, OutfitItem } from './types';
import { OUTFITS } from './game';
import { OutfitLayer } from './OutfitArt';

interface Props {
  outfit: Partial<Record<OutfitCategory, string>>;
  small?: boolean;
}

function WornItem({ item, x, y, width, height }: { item: OutfitItem; x: number; y: number; width: number; height: number }) {
  return <svg x={x} y={y} width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible" aria-hidden="true">
    <OutfitLayer item={item} />
  </svg>;
}

export default function Princess({ outfit, small = false }: Props) {
  const id = useId().replace(/:/g, '');
  const paint = (name: string) => `url(#${id}-${name})`;
  const selected = (category: OutfitCategory) => OUTFITS.find((item) => item.category === category && item.id === outfit[category]);
  const dress = selected('dress') ?? OUTFITS[0];
  const crown = selected('crown');
  const hair = selected('hair');
  const wings = selected('wings');
  const shoes = selected('shoes');
  const wand = selected('wand');
  return (
    <svg className={`princess ${small ? 'princess-small' : ''}`} viewBox="0 0 300 420" role="img" aria-label="Emma's prinses" focusable="false">
      <defs>
        <radialGradient id={`${id}-skin`} cx=".35" cy=".3" r=".8">
          <stop stopColor="#fff1d9" /><stop offset=".55" stopColor="#f4cba7" /><stop offset="1" stopColor="#ce8b70" />
        </radialGradient>
        <linearGradient id={`${id}-limb`} x1="0" x2="1">
          <stop stopColor="#d28f73" /><stop offset=".35" stopColor="#f9d7b7" /><stop offset=".62" stopColor="#ffe7ca" /><stop offset="1" stopColor="#d79c7c" />
        </linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" x2="1" y1=".1" y2=".5">
          <stop stopColor="#482830" /><stop offset=".25" stopColor="#8c5141" /><stop offset=".43" stopColor="#b97950" /><stop offset=".65" stopColor="#794437" /><stop offset="1" stopColor="#3f2530" />
        </linearGradient>
        <linearGradient id={`${id}-lock`} x1="0" x2="1">
          <stop stopColor="#75402f" /><stop offset=".38" stopColor="#c38858" /><stop offset=".62" stopColor="#9b5b40" /><stop offset="1" stopColor="#4a2d32" />
        </linearGradient>
        <radialGradient id={`${id}-iris`} cx=".4" cy=".35">
          <stop stopColor="#b9ece2" /><stop offset=".55" stopColor="#4faaa6" /><stop offset="1" stopColor="#285360" />
        </radialGradient>
        <radialGradient id={`${id}-blush`}>
          <stop stopColor="#e78b92" stopOpacity=".6" /><stop offset="1" stopColor="#f4bfaa" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop stopColor="#76518c" stopOpacity=".25" /><stop offset="1" stopColor="#76518c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="396" rx="103" ry="13" fill={paint('shadow')} />
      {wings && <WornItem item={wings} x={20} y={133} width={260} height={156} />}
      <path d="M109 65 Q91 79 98 128 Q85 160 99 189 Q96 213 126 222 L174 222 Q205 207 195 180 Q209 153 197 119 Q207 57 164 49 Q128 39 109 65Z" fill={paint('hair')} />
      <path d="M111 111 Q95 152 108 175 Q120 194 108 205 M188 109 Q206 151 190 172 Q178 192 192 204" fill="none" stroke="#cf9769" strokeOpacity=".45" strokeWidth="3" />
      <path d="M134 349 Q130 372 132 386 Q137 391 144 386 L148 349 M154 349 157 386 Q163 392 169 385 Q170 365 165 349" fill={paint('limb')} />
      {!shoes && <g fill="#b68acf" stroke="#856298" strokeWidth="1">
        <path d="M132 381 Q125 383 120 389 Q119 396 138 393 L145 388 145 380 Q138 386 132 381Z" />
        <path d="M157 380 157 388 Q172 398 181 391 Q176 382 169 381 Q163 386 157 380Z" />
        <path d="M129 385 140 387 M160 387 173 385" stroke="#f5deef" strokeWidth="2" />
      </g>}
      {shoes && <WornItem item={shoes} x={109} y={353} width={83} height={52} />}
      <path d="M140 138 139 160 Q128 163 123 172 L132 197 168 197 178 172 Q172 162 161 160 L160 138Z" fill={paint('limb')} />
      <path d="M142 141 Q151 149 159 141 L159 151 Q148 157 141 148Z" fill="#bb7d69" opacity=".25" />
      <path d="M124 170 Q114 173 109 196 L98 228 Q94 231 93 237 Q89 241 94 247 Q103 252 107 243 L116 218 Q129 191 132 177Z" fill={paint('limb')} stroke="#cc957e" strokeWidth=".7" />
      <path d="M176 170 Q188 173 193 197 L204 225 Q214 227 215 234 Q222 239 216 245 Q206 249 202 241 L188 222 Q175 196 168 178Z" fill={paint('limb')} stroke="#cc957e" strokeWidth=".7" />
      <WornItem item={dress} x={49} y={140} width={202} height={251} />
      <path d="M140 163 Q150 176 161 163" fill="none" stroke="#fbe7ad" strokeWidth="2" />
      <path d="M150 170 153 174 150 178 147 174Z" fill="#c4edf0" stroke="#fff6d8" strokeWidth=".7" />
      <ellipse cx="111" cy="106" rx="7" ry="11" fill={paint('limb')} />
      <ellipse cx="188" cy="106" rx="7" ry="11" fill={paint('limb')} />
      <path d="M111 93 Q107 58 147 56 Q188 54 189 94 L184 119 Q176 147 151 149 Q125 147 116 122Z" fill={paint('skin')} />
      <ellipse cx="126" cy="120" rx="13" ry="10" fill={paint('blush')} />
      <ellipse cx="174" cy="120" rx="13" ry="10" fill={paint('blush')} />
      <path d="M120 93 Q130 87 139 93 M162 93 Q171 87 181 93" fill="none" stroke="#825546" strokeWidth="2.5" strokeLinecap="round" />
      <g>
        <path d="M119 103 Q129 92 141 102 Q137 115 126 113 Q121 111 119 103 M160 102 Q172 92 182 103 Q179 115 166 113 Q162 111 160 102" fill="#fff8ee" />
        {[131, 171].map((x) => <g key={x}>
          <ellipse cx={x} cy="104" rx="7.5" ry="9" fill={paint('iris')} />
          <ellipse cx={x} cy="104" rx="3.8" ry="6" fill="#26353e" />
          <circle cx={x - 2.2} cy="100" r="2.5" fill="white" /><circle cx={x + 2.5} cy="107" r="1" fill="#eaffff" />
        </g>)}
        <path d="M119 103 Q128 93 141 102 M160 102 Q173 93 182 103 M119 103 116 100 M122 100 120 97 M180 101 183 97 M182 103 186 100" fill="none" stroke="#4d3436" strokeWidth="1.7" strokeLinecap="round" />
      </g>
      <path d="M149 107 Q145 119 149 121 Q152 123 156 120" fill="none" stroke="#cf957d" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M140 130 Q146 126 151 130 Q155 126 162 129 Q153 142 140 130Z" fill="#c6797c" />
      <path d="M143 131 Q151 134 159 130" fill="none" stroke="#fff2df" strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="151" cy="139" rx="5" ry="1.3" fill="#fff3db" opacity=".5" />
      <path d="M110 100 Q94 63 122 51 Q153 31 182 58 Q198 72 189 103 Q175 97 169 69 Q158 87 123 86 Q113 88 110 100Z" fill={paint('hair')} />
      <path d="M113 79 Q139 77 160 53 M116 68 Q139 62 150 50 M177 62 Q179 80 187 90" fill="none" stroke="#d7a16d" strokeWidth="2" strokeOpacity=".6" strokeLinecap="round" />
      <path d="M113 82 Q99 104 111 129 Q119 144 108 163 Q100 181 115 185 Q108 168 120 154 Q128 137 117 117 Q110 101 122 85Z" fill={paint('lock')} />
      <path d="M184 81 Q198 108 186 132 Q176 152 192 168 Q200 183 185 190 Q192 176 180 164 Q169 149 180 127 Q189 108 177 88Z" fill={paint('lock')} />
      <path d="M110 94 Q104 111 116 133 Q123 144 111 163 M187 96 Q192 110 181 135 Q175 150 188 165" fill="none" stroke="#dda06d" strokeWidth="1.5" strokeOpacity=".6" />
      <circle cx="115" cy="121" r="2.5" fill="#ffe5a0" /><circle cx="185" cy="121" r="2.5" fill="#ffe5a0" />
      {hair && <WornItem item={hair} x={169} y={60} width={40} height={40} />}
      {crown && <WornItem item={crown} x={108} y={14} width={86} height={65} />}
      {wand && <>
        <WornItem item={wand} x={188} y={149} width={70} height={110} />
        <path d="M208 232 Q214 228 217 233 L215 239 Q210 243 207 237Z" fill={paint('skin')} stroke="#cc957e" strokeWidth=".7" />
      </>}
    </svg>
  );
}

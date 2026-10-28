import { useId } from 'react';
import type { OutfitItem } from './types';

export function OutfitLayer({ item }: { item: OutfitItem }) {
  const id = useId().replace(/:/g, '');
  const silk = `${id}-silk`;
  const satin = `${id}-satin`;
  const metal = `${id}-metal`;
  const gem = `${id}-gem`;
  const rainbow = item.id === 'rainbow-dress';
  const royal = item.id === 'royal-gown';
  const diamond = item.id === 'diamond-crown';
  const queen = item.id === 'queen-outfit';
  return <g data-outfit-id={item.id}>
    <defs>
      <linearGradient id={silk} x1="0" x2="1" y1=".15" y2=".6">
        <stop stopColor={item.color} />
        <stop offset=".25" stopColor="#fff7fc" />
        <stop offset=".42" stopColor={item.color} />
        <stop offset=".72" stopColor={item.color} />
        <stop offset="1" stopColor="#644478" />
      </linearGradient>
      <linearGradient id={satin} x1="0" x2="1" y1="0" y2="1">
        {rainbow ? <>
          <stop stopColor="#ffb5d1" /><stop offset=".28" stopColor="#e4b7f4" />
          <stop offset=".55" stopColor="#97dce9" /><stop offset=".8" stopColor="#a8e3cc" /><stop offset="1" stopColor="#ffe7a2" />
        </> : <>
          <stop stopColor="#fff8ff" /><stop offset=".36" stopColor={item.color} /><stop offset="1" stopColor="#765189" />
        </>}
      </linearGradient>
      <linearGradient id={metal} x1="0" x2=".8" y1="0" y2="1">
        <stop stopColor={diamond ? '#f5ffff' : '#fff3ba'} />
        <stop offset=".35" stopColor={diamond ? '#a8dcec' : '#f6c963'} />
        <stop offset=".52" stopColor="#fffce3" />
        <stop offset=".7" stopColor={diamond ? '#6d99b9' : '#bf8128'} />
        <stop offset="1" stopColor={diamond ? '#daeff5' : '#f9d782'} />
      </linearGradient>
      <radialGradient id={gem} cx=".3" cy=".2" r=".85">
        <stop stopColor="#fff" /><stop offset=".25" stopColor="#d0f9ff" />
        <stop offset=".65" stopColor={item.color} /><stop offset="1" stopColor="#5a478b" />
      </radialGradient>
    </defs>
    {item.category === 'dress' && <g strokeLinejoin="round">
      <path d="M37 9 Q50 16 63 9 L73 17 64 32 61 39 Q75 50 95 88 Q51 105 5 88 Q25 50 39 39 L36 32 27 17Z" fill={`url(#${silk})`} stroke="#815388" strokeWidth=".7" />
      <path d="M38 40 Q50 44 62 40 Q72 62 86 91 Q51 99 14 91 Q29 61 38 40Z" fill={`url(#${satin})`} />
      <path d="M38 42 Q32 66 27 93 M46 44 Q41 72 43 96 M55 44 Q62 70 61 95 M62 42 Q73 70 79 92" fill="none" stroke="#fff9ff" strokeOpacity=".4" strokeWidth="1.2" />
      <path d="M40 43 Q30 67 22 91 M59 44 Q66 71 71 94" fill="none" stroke="#5b397c" strokeOpacity=".18" strokeWidth="1.5" />
      <path d="M28 17 Q34 11 39 14 L36 26 Q30 26 28 17 M61 14 Q67 11 72 17 Q70 26 64 26Z" fill={`url(#${satin})`} />
      <path d="M38 12 Q50 23 62 12" fill="none" stroke="#fff5df" strokeWidth="1.8" />
      <path d="M38 38 Q50 41 62 38" fill="none" stroke={`url(#${metal})`} strokeWidth="2.6" />
      <path d="M50 34 54 38 50 42 46 38Z" fill={`url(#${gem})`} stroke="#fff5d4" strokeWidth=".8" />
      {item.id === 'pink-dress' && <g fill="#ffe5ef" stroke="#dc79a8" strokeWidth=".5">
        <path d="M10 80 Q25 88 37 78 Q50 91 64 78 Q79 88 91 80 L95 88 Q50 106 5 88Z" />
        <path d="M46 39 Q33 29 34 40 Q35 48 48 41 M54 39 Q67 29 66 40 Q65 48 52 41" />
      </g>}
      {rainbow && <g fill="#fffceb">
        {[ [26, 73], [43, 58], [70, 77], [56, 87], [58, 65] ].map(([x, y]) =>
          <path key={`${x}-${y}`} d={`M${x} ${y - 2}l.7 1.4 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2Z`} />)}
      </g>}
      {royal && <g>
        <path d="M38 40 Q41 70 9 88 Q25 53 38 40 M62 40 Q59 70 91 88 Q75 53 62 40" fill={`url(#${silk})`} stroke="#ffe3a3" strokeWidth="1" />
        <path d="M13 88 Q50 101 87 88 M34 51 Q40 69 50 75 Q60 69 66 51" fill="none" stroke="#fff0be" strokeWidth="1.2" />
        {[26, 38, 50, 62, 74].map((x) => <circle key={x} cx={x} cy={92 - Math.abs(50 - x) * .09} r="1" fill="#fff8df" />)}
      </g>}
      <path d="M8 88 Q50 102 92 88" fill="none" stroke="#ffeddd" strokeWidth="1.2" strokeDasharray={royal ? undefined : '1 2'} />
      <ellipse cx="46" cy="25" rx="6" ry="8" fill="#fff" opacity=".12" />
    </g>}
    {item.category === 'crown' && <g strokeLinejoin="round">
      <path d="M16 66 8 33 29 49 37 23 50 43 63 23 72 49 92 33 84 66Z" fill={`url(#${metal})`} stroke={diamond ? '#709cb9' : '#ae7625'} strokeWidth="1.3" />
      <path d="M16 63 Q50 72 84 63 L83 73 Q50 83 17 73Z" fill={`url(#${metal})`} stroke="#bc9955" strokeWidth="1" />
      <path d="M50 38 61 52 50 65 39 52Z" fill={`url(#${gem})`} stroke="#fff7d4" strokeWidth="2" />
      <path d="M50 38 48 51 39 52 M48 51 61 52 M48 51 50 65" fill="none" stroke="white" opacity=".65" />
      {[22, 32, 68, 78].map((x) => <circle key={x} cx={x} cy={x < 40 ? 59 + (x - 22) * .2 : 61 - (x - 68) * .2} r="2.7" fill={`url(#${gem})`} stroke="#fff4cc" strokeWidth=".8" />)}
      {[ [8, 33], [37, 23], [63, 23], [92, 33] ].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill={`url(#${metal})`} stroke="#fff6cd" strokeWidth=".7" />)}
      {diamond && <path d="M50 10 54 22 50 32 46 22Z" fill={`url(#${gem})`} stroke="#f4ffff" />}
      <path d="M20 70 Q50 78 80 70" fill="none" stroke="#fff8d5" strokeWidth="1.6" />
      <path d="M70 32v10m-5-5h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </g>}
    {item.category === 'shoes' && <g transform="translate(0 10)">
      {[false, true].map((flipped) => <g key={String(flipped)} transform={flipped ? 'translate(100 0) scale(-1 1)' : undefined}>
        <path d="M40 32 Q31 34 29 51 Q26 57 13 61 Q5 66 9 73 Q21 80 43 69 L46 40Z" fill={`url(#${silk})`} stroke="#aa7d3b" strokeWidth="1.1" />
        <path d="M10 72 Q24 77 43 66 L43 71 Q21 82 10 76Z" fill={`url(#${metal})`} />
        <ellipse cx="37" cy="43" rx="6" ry="10" transform="rotate(15 37 43)" fill="#8a6547" />
        <path d="M29 52 42 50" stroke="#ffebae" strokeWidth="2.6" />
        <path d="M24 59 28 63 24 68 20 63Z" fill={`url(#${gem})`} stroke="#fff5bf" />
        <path d="M14 66 Q19 62 24 62" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="34" cy="61" r="1" fill="white" /><circle cx="17" cy="71" r=".8" fill="white" />
      </g>)}
    </g>}
    {item.category === 'wand' && <g transform="rotate(18 50 50)">
      <rect x="47" y="34" width="6" height="58" rx="3" fill={`url(#${metal})`} stroke="#a57744" strokeWidth=".7" />
      <path d="M48 53h4m-4 5h4m-4 5h4m-4 5h4m-4 5h4m-4 5h4" stroke="#a578ac" strokeWidth="2" />
      <path d="M50 6 57 21 73 23 61 35 64 52 50 44 36 52 39 35 27 23 43 21Z" fill={`url(#${metal})`} stroke="#fff2b6" strokeWidth="1.5" />
      <path d="M50 14 55 25 65 27 57 34 59 44 50 39 41 44 43 34 35 27 45 25Z" fill={`url(#${gem})`} />
      <path d="M50 14 48 29 35 27 M48 29 59 44" fill="none" stroke="#fff" opacity=".7" />
      <path d="M47 48 Q25 59 37 70 M53 48 Q71 57 62 75" fill="none" stroke="#e4b6ed" strokeWidth="2" />
      <path d="M77 10v10m-5-5h10" stroke="#ffe7a2" strokeWidth="1.7" strokeLinecap="round" />
    </g>}
    {item.category === 'hair' && <g>
      <path d="M22 65 Q50 82 79 45" fill="none" stroke={`url(#${metal})`} strokeWidth="5" strokeLinecap="round" />
      <path d="M48 49 Q25 49 22 27 Q48 26 48 49 M53 53 Q75 46 85 60 Q68 76 53 53" fill="#85bda8" stroke="#c6e5c1" />
      {[0, 60, 120, 180, 240, 300].map((angle) => <ellipse key={angle} cx="50" cy="34" rx="10" ry="19" transform={`rotate(${angle} 50 50)`} fill={`url(#${silk})`} stroke="#ffd9e7" strokeWidth=".8" />)}
      <circle cx="50" cy="50" r="11" fill={`url(#${metal})`} />
      <circle cx="48" cy="47" r="5" fill="#fff8cc" /><circle cx="73" cy="64" r="3" fill="#fff7e2" />
    </g>}
    {item.category === 'wings' && <g>
      {[false, true].map((flipped) => <g key={String(flipped)} transform={flipped ? 'translate(100 0) scale(-1 1)' : undefined}>
        <path d={queen
          ? 'M48 64 Q15 54 7 11 Q34 14 43 44 Q14 39 8 46 Q10 69 37 72 Q16 69 15 79 Q28 100 48 64Z'
          : 'M48 59 Q37 4 9 10 Q-4 47 37 61 Q5 54 14 82 Q32 99 48 59Z'}
          fill={`url(#${satin})`} fillOpacity=".87" stroke={queen ? '#edc67c' : '#c9f8f2'} strokeWidth="1.3" />
        <path d="M47 61 Q24 33 12 16 M47 61 Q26 51 15 43 M45 65 Q28 68 19 80" fill="none" stroke={queen ? '#fff1bb' : '#f0ffff'} strokeWidth="1" />
        <path d="M43 56 Q24 19 14 19 Q13 35 30 48" fill="none" stroke="white" strokeOpacity=".6" strokeWidth="2.4" />
        {[ [18, 30], [25, 45], [31, 57], [23, 74] ].map(([x, y]) => <circle key={x} cx={x} cy={y} r={queen ? 2 : 1.3} fill={queen ? '#fff0be' : '#fff'} />)}
      </g>)}
      <path d="M50 51 54 61 50 71 46 61Z" fill={`url(#${gem})`} stroke="#fff5ca" />
    </g>}
  </g>;
}

export default function OutfitArt({ item, className = '' }: { item: OutfitItem; className?: string }) {
  return <svg className={`outfit-art ${className}`} viewBox="0 0 100 100" role="img" aria-label={item.name} focusable="false">
    <ellipse cx="50" cy="94" rx="35" ry="3" fill="#76508c" opacity=".12" />
    <OutfitLayer item={item} />
  </svg>;
}

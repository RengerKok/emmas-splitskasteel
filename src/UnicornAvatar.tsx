import { useId } from 'react';
import { defaultUnicorn, UNICORN_ITEMS, UNICORNS } from './unicorn';
import type { UnicornProgress, UnicornSlot } from './unicorn';

function Flower({ x, y, color = '#f49cbd', size = 1 }: { x: number; y: number; color?: string; size?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    {[0, 60, 120, 180, 240, 300].map((angle) => <ellipse key={angle} cx="0" cy="-7" rx="4" ry="6" fill={color} transform={`rotate(${angle})`} />)}
    <circle r="4" fill="#ffd96d" />
  </g>;
}

export default function UnicornAvatar({ unicorn = defaultUnicorn(), celebrate = false, scenery = true }: { unicorn?: UnicornProgress; celebrate?: boolean; scenery?: boolean }) {
  const id = useId().replace(/:/g, '');
  const body = UNICORNS.find((kind) => kind.id === unicorn.kind)?.color ?? '#fffaf4';
  const item = (slot: UnicornSlot) => UNICORN_ITEMS.find((entry) => entry.id === unicorn.outfit[slot]);
  const mane = item('mane')?.color ?? '#ec9abb';
  const tail = item('tail')?.color ?? mane;
  const saddle = item('saddle');
  const head = item('head');
  const wings = item('wings');
  return <svg className={`unicorn-avatar ${celebrate ? 'unicorn-celebrate' : ''}`} viewBox="0 0 400 330" role="img" aria-label={`${unicorn.name || UNICORNS.find((kind) => kind.id === unicorn.kind)?.name || 'Sterretje'}, jouw magische eenhoorn`}>
    <defs>
      <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#fff" /><stop offset=".7" stopColor={body} /><stop offset="1" stopColor="#d9c8da" /></linearGradient>
      <linearGradient id={`${id}-rainbow`}><stop stopColor="#ef88a9" /><stop offset=".3" stopColor="#f6cf68" /><stop offset=".6" stopColor="#70c8aa" /><stop offset="1" stopColor="#8cace5" /></linearGradient>
    </defs>
    {scenery && <g data-item={item('background')?.id}>
      <rect width="400" height="330" rx="8" fill={item('background')?.color ?? '#daefe2'} />
      <circle cx="63" cy="59" r="29" fill="#fff4bc" />
      <path d="M0 235 Q80 190 190 236 Q310 176 400 225 V330 H0Z" fill="#a9d8b8" />
      <path d="M0 280 Q180 223 400 270 V330 H0Z" fill="#7abc98" />
      {[30, 75, 320, 365].map((position, index) => <Flower key={position} x={position} y={285 + index % 2 * 18} color={index % 2 ? '#fff7c0' : '#f5aacb'} size={0.8} />)}
      {item('background')?.id === 'background-stars' && [40, 100, 160, 230, 340].map((position) => <text key={position} x={position} y={30 + position % 65} fill="#fff" fontSize="22">✦</text>)}
    </g>}
    <ellipse cx="198" cy="291" rx="119" ry="15" fill="#367967" opacity=".15" />
    <g className="unicorn-body">
      <path data-item={item('tail')?.id} d="M112 180 C37 144 62 253 23 260 C76 282 106 255 89 219 Q84 198 116 205" fill={tail} stroke="#aa7ea6" strokeWidth="2" />
      <path d="M100 188 Q56 187 67 239 Q72 257 48 262" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="5" />
      <g fill={`url(#${id}-body)`} stroke="#b6a1b3" strokeWidth="2">
        <path d="M125 210 L117 281 Q128 293 139 279 L150 215Z" />
        <path d="M214 208 L225 281 Q236 292 248 280 L243 196Z" />
      </g>
      {wings && <g data-item={wings.id} fill={wings.id === 'wings-rainbow' ? `url(#${id}-rainbow)` : wings.color} stroke="#9874af" strokeWidth="2">
        <path d="M183 181 C115 147 91 61 133 63 C163 65 191 122 188 169 C201 105 239 70 254 98 C272 132 224 171 183 181Z" />
        <path d="M182 173 C143 123 119 141 135 166 Q149 192 183 194 C206 209 235 181 223 162 Q214 148 182 173Z" />
        <path d="M132 83 Q152 112 177 164 M239 111 L198 164" fill="none" stroke="#fff" strokeWidth="5" opacity=".7" />
      </g>}
      <path d="M242 83 Q203 84 209 119 Q184 116 202 148 Q184 155 201 185 Q208 211 242 210 L269 101Z" fill={mane} data-item={item('mane')?.id} stroke="#b886b0" strokeWidth="2" />
      <path d="M107 179 C120 147 190 158 218 162 Q229 139 237 106 L279 101 Q287 164 257 208 C239 239 138 248 110 218Z" fill={`url(#${id}-body)`} stroke="#b6a1b3" strokeWidth="2" />
      <path d="M128 215 L140 284 Q153 294 164 282 L166 223 M216 218 L204 281 Q216 294 228 281 L244 213" fill={`url(#${id}-body)`} stroke="#b6a1b3" strokeWidth="2" />
      <g fill="#aa8caa"><path d="M118 275 L138 275 L137 284 Q127 290 117 283Z" /><path d="M142 276 L164 276 L164 285 Q153 292 141 285Z" /><path d="M206 274 L229 274 L227 284 Q215 291 204 283Z" /><path d="M226 274 L248 274 L249 284 Q236 290 225 282Z" /></g>
      {item('shoes') && <g data-item={item('shoes')?.id} fill={item('shoes')?.color} stroke="#fff" strokeWidth="2">
        {[117, 141, 204, 225].map((position) => <g key={position}><path d={`M${position} 270 h24 v15 q-12 10 -24 0Z`} /><text x={position + 5} y="283" fill="#fff" fontSize="14">✦</text></g>)}
      </g>}
      {saddle && <g data-item={saddle.id}>
        <path d="M133 163 Q169 170 202 162 L198 201 Q165 221 132 198Z" fill={saddle.id === 'saddle-rainbow' ? `url(#${id}-rainbow)` : saddle.color} stroke="#fff1bb" strokeWidth="4" />
        <path d="M144 166 Q168 183 192 166" fill="none" stroke="#8a668e" strokeWidth="7" strokeLinecap="round" />
        <path d="M180 183 V217 Q171 229 165 217 L166 208 H180" fill="none" stroke="#dbb450" strokeWidth="4" />
        {saddle.id === 'saddle-diamond' ? <path d="M148 188 L160 178 L173 188 L160 204Z M148 188 H173 M160 178 V204" fill="#eafcff" stroke="#54a4c0" strokeWidth="2" /> : <text x="149" y="200" fontSize="25" fill="#fff8c6">{saddle.id === 'saddle-stars' ? '✦' : '♡'}</text>}
      </g>}
      <path d="M252 95 L248 59 Q267 58 271 86 M281 88 L293 59 Q306 72 295 98" fill={body} stroke="#b6a1b3" strokeWidth="2" />
      <path d="M255 80 L254 65 L263 80 M287 82 L294 68 L296 81" fill="#e5a5bb" />
      <path d="M267 91 L276 29 L289 92Z" fill="#f7d873" stroke="#c6a04c" strokeWidth="2" />
      <path d="M270 70 L285 61 M272 54 L281 48 M269 83 L287 73" stroke="#fff5c3" strokeWidth="3" />
      <path d="M238 107 C233 84 279 76 296 101 Q304 119 319 132 C334 155 300 169 281 154 Q257 155 244 140Z" fill={`url(#${id}-body)`} stroke="#b6a1b3" strokeWidth="2" />
      <path d="M241 101 Q233 77 259 83 Q283 71 288 98 Q272 91 259 112 Q251 123 243 119Z" fill={mane} stroke="#b886b0" strokeWidth="2" />
      <ellipse cx="301" cy="145" rx="22" ry="14" fill="#f4d5dd" />
      <ellipse cx="280" cy="118" rx="7" ry="10" fill="#4c3b56" /><circle cx="282" cy="115" r="3" fill="white" />
      <path d="M276 110 L272 106 M284 111 L287 107 M302 153 Q311 154 316 147" fill="none" stroke="#694e68" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="273" cy="136" rx="9" ry="5" fill="#eba7bf" opacity=".65" /><circle cx="317" cy="139" r="2" fill="#a77992" />
      {head && <g data-item={head.id}>
        {head.id === 'head-basic' && <Flower x={249} y={100} color={head.color} size={0.8} />}
        {head.id === 'head-bow' && <path d="M251 95 Q226 72 228 104 Q230 119 252 100 Q275 118 271 91 Q268 79 251 95Z" fill={head.color} stroke="#b54c88" strokeWidth="2" />}
        {head.id === 'head-flowers' && [245, 260, 276, 291].map((position, index) => <Flower key={position} x={position} y={94 + (index === 0 || index === 3 ? 5 : 0)} color={index % 2 ? '#fff4bd' : head.color} size={0.7} />)}
        {head.id === 'head-crown' && <path d="M246 93 L239 65 L254 75 L264 55 L276 75 L290 62 L286 93Z" fill={head.color} stroke="#b18a32" strokeWidth="2" />}
        {head.id === 'head-bridle' && <path d="M254 94 L280 150 M299 128 L292 159 M280 150 Q255 192 243 166" fill="none" stroke={head.color} strokeWidth="6" />}
        {head.id === 'head-stars' && <><path d="M241 104 Q265 79 294 106" fill="none" stroke={head.color} strokeWidth="4" />{[247, 264, 281].map((position) => <text key={position} x={position - 8} y="102" fontSize="21" fill={head.color}>✦</text>)}</>}
      </g>}
      {item('decoration') && <g data-item={item('decoration')?.id}>{[126, 149, 177].map((position) => <Flower key={position} x={218} y={position} color="#b9f1f0" size={0.6} />)}</g>}
      {item('garland') && <g data-item={item('garland')?.id}><path d="M115 205 Q172 260 231 204" fill="none" stroke="#dbad4e" strokeWidth="2" />{[132, 154, 177, 201, 220].map((position) => <text key={position} x={position - 7} y={231 + (position > 145 && position < 205 ? 9 : 0)} fill="#ffdd74" fontSize="20">✦</text>)}</g>}
      {item('bells') && <g data-item={item('bells')?.id} fill="#efc55e" stroke="#b29241" strokeWidth="2"><path d="M239 166 Q256 179 270 164" fill="none" />{[244, 260].map((position) => <g key={position}><path d={`M${position} 171 q-7 6 -5 14 h13 q2 -8 -5 -14Z`} /><circle cx={position + 2} cy="188" r="2" /></g>)}</g>}
    </g>
    {celebrate && <g className="unicorn-sparkles" fill="#e5af30">{[35, 85, 145, 315, 360].map((position, index) => <text key={position} x={position} y={70 + index % 3 * 40} fontSize="28">✦</text>)}</g>}
  </svg>;
}
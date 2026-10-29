export default function ClockValleyScene() {
  return <svg className="valley-landscape" viewBox="0 0 1100 360" role="img" aria-label="Groene Klokkenvallei met een regenboog, waterval, bloemen en een houten klokkentoren">
    <rect width="1100" height="360" fill="#def3f4" />
    <circle cx="925" cy="62" r="35" fill="#ffe6a0" />
    {['#ed9eaf', '#f7be8c', '#f4db88', '#9bd7a9', '#8ccbd8'].map((color, index) => <path key={color} d={`M${170 + index * 12} 215 A${300 - index * 12} ${245 - index * 12} 0 0 1 ${770 - index * 12} 215`} fill="none" stroke={color} strokeWidth="13" opacity=".85" />)}
    <path d="M0 210 Q135 85 300 206 Q460 104 610 203 Q850 60 1100 160 V360 H0Z" fill="#a7d6a5" />
    <path d="M775 184 Q806 156 836 185 L863 295 L758 295Z" fill="#79b5a3" />
    <path d="M796 180 H820 Q815 226 836 279 H782 Q800 228 796 180Z" fill="#a5e5e9" />
    <path d="M806 188 Q800 238 815 273" fill="none" stroke="#efffff" strokeWidth="5" />
    <path d="M0 281 Q207 173 401 271 Q595 201 787 288 Q957 231 1100 267 V360 H0Z" fill="#77bd96" />
    <path d="M510 231 Q560 280 491 305 Q450 330 554 360 H724 Q548 324 585 298 Q645 268 537 231Z" fill="#f7e1a3" />
    <g stroke="#8f6954" strokeWidth="3"><path d="M482 116 H563 V247 H482Z" fill="#ce9b71" /><path d="M468 116 L521 65 L578 116Z" fill="#cf7a70" /><path d="M497 116 V245 M548 116 V245 M482 196 H563" fill="none" /><path d="M510 247 V214 Q523 195 537 214 V247" fill="#876856" /></g>
    <circle cx="523" cy="155" r="29" fill="#fff7de" stroke="#7c654f" strokeWidth="3" />
    <path d="M523 135 V155 L535 160" fill="none" stroke="#4c7472" strokeWidth="4" strokeLinecap="round" />
    {[100, 970].map((position) => <g key={position}><path d={`M${position} 275 V161`} stroke="#a77d64" strokeWidth="17" /><circle cx={position - 22} cy="162" r="39" fill="#67aa91" /><circle cx={position + 26} cy="156" r="42" fill="#85c5a1" /><circle cx={position} cy="125" r="39" fill="#99d1ab" /><text x={position - 10} y="150" fill="#fff3a4" fontSize="30">✦</text></g>)}
    {[45, 122, 200, 300, 385, 740, 882, 958, 1040].map((position, index) => <g key={position} transform={`translate(${position} ${304 + index % 3 * 16})`}>
      <path d="M0 5 V30 M0 20 Q-18 6 -16 21 Q-8 30 0 25" fill="#438964" stroke="#438964" strokeWidth="3" />
      {[0, 72, 144, 216, 288].map((angle) => <ellipse key={angle} cx="0" cy="-9" rx="7" ry="10" fill={index % 2 ? '#ffdd86' : '#f5b0c7'} transform={`rotate(${angle})`} />)}
      <circle r="7" fill="#fffbe5" /><path d="M0 -4 V0 L4 2" fill="none" stroke="#67998d" strokeWidth="2" />
    </g>)}
    {[230, 700, 900].map((position) => <g className="valley-butterfly" key={position} transform={`translate(${position} ${165 + position % 70})`}><path d="M0 0 C-35 -27 -22 27 0 5 C24 27 31 -26 0 0" fill="#f3bbd1" stroke="#b886ad" strokeWidth="2" /><path d="M0 -3 V10" stroke="#79597c" strokeWidth="3" /></g>)}
  </svg>;
}
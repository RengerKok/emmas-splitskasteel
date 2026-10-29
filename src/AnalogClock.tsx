import { useId, useRef } from 'react';
import type { PointerEvent } from 'react';
import { dragClockHand, handAngles, shiftTime, timeParts } from './clock';

interface Props {
  time: number;
  onChange?: (time: number) => void;
  highlight?: boolean;
  guideTime?: number;
  label?: string;
}

function ClockHand({ angle, length, color, thick, hand, interactive, onStart, onStep }: {
  angle: number; length: number; color: string; thick: number; hand: 'hour' | 'minute'; interactive: boolean;
  onStart: (event: PointerEvent<SVGGElement>, hand: 'hour' | 'minute') => void; onStep: (delta: number) => void;
}) {
  const rotation = useRef(angle);
  const difference = ((angle - rotation.current) % 360 + 540) % 360 - 180;
  rotation.current += difference;
  return <g className="clock-hand" style={{ transform: `rotate(${rotation.current}deg)`, transformOrigin: '160px 160px' }}
    data-hand={hand} onPointerDown={(event) => interactive && onStart(event, hand)}
    role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined}
    aria-label={interactive ? hand === 'hour' ? 'Korte uurwijzer aanpassen' : 'Lange minutenwijzer aanpassen' : undefined}
    onKeyDown={(event) => {
      if (!interactive || !['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      onStep((event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 1) * (hand === 'hour' ? 4 : 1));
    }}>
    <line x1="160" y1="175" x2="160" y2={160 - length} stroke={color} strokeWidth={thick} strokeLinecap="round" />
    {interactive && <><line x1="160" y1="140" x2="160" y2={160 - length} stroke="transparent" strokeWidth="36" strokeLinecap="round" />
      <circle cx="160" cy={160 - length} r="11" fill={color} stroke="white" strokeWidth="3" /></>}
  </g>;
}

export default function AnalogClock({ time, onChange, highlight = false, guideTime, label = 'Oefenklok met een korte roze uurwijzer en een lange blauwe minutenwijzer' }: Props) {
  const titleId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<{ hand: 'hour' | 'minute'; pointer: number; time: number } | null>(null);
  const angles = handAngles(time);
  const { minute } = timeParts(time);

  function move(event: PointerEvent<SVGSVGElement>) {
    const active = dragging.current;
    const matrix = svgRef.current?.getScreenCTM();
    if (!active || active.pointer !== event.pointerId || !matrix || !onChange) return;
    const position = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    if (Math.hypot(position.x - 160, position.y - 160) < 25) return;
    const angle = Math.atan2(position.x - 160, 160 - position.y) * 180 / Math.PI;
    const next = dragClockHand(active.time, active.hand, angle);
    active.time = next;
    onChange(next);
  }

  function start(event: PointerEvent<SVGGElement>, hand: 'hour' | 'minute') {
    if (dragging.current) return;
    event.preventDefault();
    dragging.current = { hand, pointer: event.pointerId, time };
    svgRef.current?.setPointerCapture(event.pointerId);
  }

  function stop(event: PointerEvent<SVGSVGElement>) {
    if (dragging.current?.pointer !== event.pointerId) return;
    dragging.current = null;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
  }

  return <svg ref={svgRef} className={`analog-clock ${onChange ? 'clock-editable' : ''}`} viewBox="0 0 320 320" role={onChange ? 'group' : 'img'} aria-labelledby={titleId}
    onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={() => { dragging.current = null; }}>
    <title id={titleId}>{label}</title>
    <circle cx="160" cy="160" r="153" fill="#e6f4e9" stroke="#78b6a1" strokeWidth="4" />
    <circle cx="160" cy="160" r="142" fill="#fffef9" stroke="#d5b55d" strokeWidth="2" />
    {highlight && <path d={`M160 160 L160 22 A138 138 0 ${minute > 30 ? 1 : 0} 1 ${160 + Math.sin(angles.minute * Math.PI / 180) * 138} ${160 - Math.cos(angles.minute * Math.PI / 180) * 138} Z`} fill="#dfedf8" />}
    {Array.from({ length: 60 }, (_, index) => <line key={index} x1="160" y1="25" x2="160" y2={index % 5 === 0 ? 35 : 29} transform={`rotate(${index * 6} 160 160)`} stroke={index % 5 === 0 ? '#407466' : '#c1cfc7'} strokeWidth={index % 5 === 0 ? 3 : 1} />)}
    {Array.from({ length: 12 }, (_, index) => {
      const number = index + 1;
      const angle = number * Math.PI / 6;
      const point = { x: 160 + Math.sin(angle) * 112, y: 160 - Math.cos(angle) * 112 };
      return <g key={number}>{highlight && number % 3 === 0 && <circle cx={point.x} cy={point.y} r="19" fill="#ffedac" />}
        {guideTime !== undefined && number === (guideTime % 4 * 3 || 12) && <circle cx={point.x} cy={point.y} r="20" fill="#d5ecff" stroke="#237ba0" strokeWidth="3" />}
        <text x={point.x} y={point.y} textAnchor="middle" dominantBaseline="central" fill="#2c524b" fontSize="25" fontWeight="800">{number}</text></g>;
    })}
    <ClockHand angle={angles.minute} length={94} color="#237ba0" thick={7} hand="minute" interactive={Boolean(onChange)} onStart={start} onStep={(delta) => onChange?.(shiftTime(time, delta))} />
    <ClockHand angle={angles.hour} length={66} color="#c24c82" thick={12} hand="hour" interactive={Boolean(onChange)} onStart={start} onStep={(delta) => onChange?.(shiftTime(time, delta))} />
    <circle cx="160" cy="160" r="10" fill="#f2cb68" stroke="#fff" strokeWidth="3" pointerEvents="none" />
  </svg>;
}

export function ClockControls({ onStep, disabled = false }: { onStep: (quarters: number) => void; disabled?: boolean }) {
  return <div className="clock-controls">
    <div><span className="hour-label">Korte wijzer · uur</span><button disabled={disabled} title="Uur terug" aria-label="Uur terug" onClick={() => onStep(-4)}>−</button><button disabled={disabled} title="Uur vooruit" aria-label="Uur vooruit" onClick={() => onStep(4)}>+</button></div>
    <div><span className="minute-label">Lange wijzer · kwartier</span><button disabled={disabled} title="Kwartier terug" aria-label="Kwartier terug" onClick={() => onStep(-1)}>−</button><button disabled={disabled} title="Kwartier vooruit" aria-label="Kwartier vooruit" onClick={() => onStep(1)}>+</button></div>
  </div>;
}
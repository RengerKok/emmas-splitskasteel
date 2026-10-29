import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Progress } from './types';
import { categoriesFor, categoryOf, CATEGORY_LABELS, CLOCK_CATEGORIES, CLOCK_LEVELS, clockChoices, clockLevel, clockTime, clockTip, formatTime, nextClockQuestion, shiftTime, skillMastered } from './clock';
import type { ClockLevel, ClockMode } from './clock';
import { completeClockMission, recordClockAnswer } from './game';
import { chooseMission, CLOCK_JOKES, CLOCK_MISSIONS, CLOCK_PRAISE } from './clockContent';
import AnalogClock, { ClockControls } from './AnalogClock';
import ClockValleyScene from './ClockValleyScene';
import UnicornAvatar from './UnicornAvatar';
import UnicornStable from './UnicornStable';
import { UNICORN_ITEMS } from './unicorn';
import './clockValley.css';

type UpdateProgress = Dispatch<SetStateAction<Progress>>;
type View = 'map' | 'choice' | 'setter' | 'missions' | 'mission' | 'stable' | 'tutorial';
const MISSION_LENGTH = 6;

function ClockTutorial() {
  const [time, setTime] = useState(clockTime(2));
  return <section className="clock-tutorial">
    <h1>Sterretjes klokkenles</h1>
    <div className="clock-lesson-layout"><div><AnalogClock time={time} onChange={setTime} highlight /><ClockControls onStep={(delta) => setTime((current) => shiftTime(current, delta))} /></div>
      <div className="clock-lesson-copy"><div className="lesson-guide"><UnicornAvatar scenery={false} /><h2>Ontdek de wijzers</h2></div>
        <p className="hour-label">De korte roze wijzer vertelt het uur.</p><p className="minute-label">De lange blauwe wijzer vertelt hoeveel minuten er voorbij zijn.</p>
        <div className="clock-presets" role="group" aria-label="Kies een voorbeeld">{[0, 30, 15, 45].map((minute) => <button className="secondary-button" key={minute} aria-pressed={time === clockTime(2, minute)} onClick={() => setTime(clockTime(2, minute))}>{minute === 0 ? 'Heel uur' : minute === 30 ? 'Half' : minute === 15 ? 'Kwart over' : 'Kwart voor'}</button>)}</div>
        <h2>{formatTime(time)}</h2><p>{clockTip(time)}</p><button className="primary-button" onClick={() => setTime((current) => shiftTime(current, 1))}>Een kwartier later →</button>
      </div>
    </div>
  </section>;
}

export function ClockProgressPanel({ progress, setProgress }: { progress: Progress; setProgress: UpdateProgress }) {
  const clock = progress.clock;
  const attempts = CLOCK_CATEGORIES.reduce((total, category) => total + clock.skills[category].attempts, 0);
  const correct = CLOCK_CATEGORIES.reduce((total, category) => total + clock.skills[category].correct, 0);
  const purchases = progress.unicorn.owned.filter((id) => !['saddle-basic', 'head-basic', 'mane-pink', 'tail-pink', 'background-meadow'].includes(id));
  return <section className="clock-parent">
    <h2>De Magische Klokkenvallei</h2>
    <div className="stats-grid"><div className="stat-card"><strong>{clock.answered}</strong><span>klokopgaven afgerond</span></div><div className="stat-card"><strong>{attempts ? Math.round(correct / attempts * 100) : 0}%</strong><span>goed van {attempts} pogingen</span></div><div className="stat-card"><strong>{clock.missions}</strong><span>eenhoornmissies afgerond</span></div></div>
    <p>{clock.xp} XP verdiend in de vallei · {progress.xp} XP totaal · {progress.availableXp} XP beschikbaar</p>
    <label>Klokniveau<select value={clock.selectedLevel} onChange={(event) => setProgress((current) => ({ ...current, clock: { ...current.clock, selectedLevel: event.target.value === 'auto' ? 'auto' : Number(event.target.value) as ClockLevel } }))}>
      <option value="auto">Automatisch aanpassen</option>{CLOCK_LEVELS.map((name, index) => <option key={name} value={index + 1}>{index + 1}. {name}</option>)}
    </select></label>
    <p>Huidig niveau: {clockLevel(clock)}. {CLOCK_LEVELS[clockLevel(clock) - 1]}</p>
    <div className="clock-skills">{CLOCK_CATEGORIES.map((category) => {
      const skill = clock.skills[category];
      const percentage = skill.attempts ? Math.round(skill.correct / skill.attempts * 100) : 0;
      return <div key={category}><strong>{CATEGORY_LABELS[category]}</strong><progress value={skill.correct} max={Math.max(1, skill.attempts)} /><span>{skill.attempts ? `${percentage}% · ${skill.correct}/${skill.attempts}` : 'Nog niet geoefend'}</span><small>{skillMastered(skill) ? 'Goed onder de knie' : skill.attempts ? 'Nog oefenen' : 'Nog ontdekken'}</small></div>;
    })}</div>
    <p>Automatisch: eerst zes zelfstandige goede antwoorden per categorie, met drie achter elkaar goed en minstens 75% juiste pogingen. Hints en fouten kosten geen XP. Aankopen veranderen het totaal en prinsessenbeloningen niet.</p>
    <p>{purchases.length} accessoires gekocht · {clock.review.length} tijden om te herhalen</p>
    {purchases.length > 0 && <ul className="clock-purchases">{purchases.map((id) => <li key={id}>{unicornItemName(id)}</li>)}</ul>}
  </section>;
}

function unicornItemName(id: string) { return UNICORN_ITEMS.find((item) => item.id === id)?.name ?? id; }

export default function ClockValley({ progress, setProgress, onHome, onChime, storageError }: { progress: Progress; setProgress: UpdateProgress; onHome: () => void; onChime: () => void; storageError: string }) {
  const [view, setView] = useState<View>('map');
  const [target, setTarget] = useState(clockTime(2));
  const [time, setTime] = useState(clockTime(12));
  const [options, setOptions] = useState<number[]>([]);
  const [mode, setMode] = useState<ClockMode>('choice');
  const [hints, setHints] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [mission, setMission] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const answered = useRef(false);
  const level = clockLevel(progress.clock);
  const playing = view === 'choice' || view === 'setter' || view === 'mission';
  const story = CLOCK_MISSIONS[mission];
  const prompt = view === 'mission' ? `${story.prompt} ${formatTime(target)}. ${mode === 'setter' ? 'Kun jij de klok goedzetten?' : 'Welke klok hoort erbij?'}` : mode === 'choice' ? `Hoe laat is het, ${progress.name}?` : `Kun jij de klok op ${formatTime(target)} zetten?`;

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoice = () => setVoice(window.speechSynthesis.getVoices().find((candidate) => candidate.localService && candidate.lang.toLowerCase().startsWith('nl')) ?? null);
    updateVoice();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoice);
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', updateVoice); window.speechSynthesis.cancel(); };
  }, []);
  useEffect(() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }, [view, target, progress.sound]);

  function question(nextMode: ClockMode, preferred?: number) {
    const next = preferred ?? nextClockQuestion(progress.clock, target);
    const skill = progress.clock.skills[categoryOf(next)];
    setTarget(next);
    setTime(next === 0 ? 4 : 0);
    setOptions(clockChoices(next, level));
    setMode(nextMode);
    setHints(skill.attempts >= 3 && skill.correct / skill.attempts < 0.75 ? 2 : 0);
    setWrong(false);
    setCorrect(false);
    setSelected(null);
    setFeedback('');
    answered.current = false;
  }

  function start(nextView: 'choice' | 'setter') {
    setView(nextView);
    setFinished(false);
    question(nextView);
  }

  function startMission(index: number) {
    setMission(index);
    setStep(0);
    setFinished(false);
    setView('mission');
    const preferred = CLOCK_MISSIONS[index].time;
    question('setter', categoriesFor(level).includes(categoryOf(preferred)) ? preferred : undefined);
  }

  function submit(value: number) {
    if (answered.current || finished) return;
    setSelected(value);
    const good = value === target;
    const assisted = hints > 0 || wrong;
    const last = view === 'mission' && step === MISSION_LENGTH - 1 && good;
    setProgress((current) => {
      const updated = recordClockAnswer(current, target, good, mode, assisted);
      return last ? completeClockMission(updated, mission) : updated;
    });
    if (!good) {
      setWrong(true);
      setFeedback(mode === 'choice' ? `Bijna goed, ${progress.name}! Kijk nog eens waar de grote wijzer staat. 💖` : 'Dat is nog niet helemaal goed. Zullen we samen naar de wijzers kijken?');
      return;
    }
    answered.current = true;
    setCorrect(true);
    const earned = recordClockAnswer(progress, target, true, mode, assisted);
    const reward = earned.xp - progress.xp;
    const levelBonus = earned.clock.completedLevels.length > progress.clock.completedLevels.length;
    const praise = CLOCK_PRAISE[progress.clock.answered % CLOCK_PRAISE.length];
    setFeedback(`${mode === 'setter' ? 'Geweldig! Jij kunt de klok al heel goed zetten! ' : ''}${praise} +${reward} XP${levelBonus ? ' (met 40 bonus-XP voor je klokniveau!)' : ''}`);
    if (progress.sound) onChime();
    if (last) setFinished(true);
  }

  function next() {
    if (view === 'mission') {
      setStep((current) => current + 1);
      question((step + 1) % 2 === 0 ? 'setter' : 'choice');
    } else question(mode);
  }

  function speak() {
    if (!voice || !progress.sound) return;
    const speech = new SpeechSynthesisUtterance(prompt);
    speech.voice = voice;
    speech.lang = voice.lang;
    speech.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  }

  return <main className="app-shell valley-shell">
    <header className="topbar valley-topbar"><button className="back-button" onClick={view === 'map' ? onHome : () => setView('map')}>← {view === 'map' ? 'Kasteel' : 'Vallei'}</button><div className="brand-mini">De Klokkenvallei</div><div className="xp-pill">✨ {progress.xp} XP</div></header>
    {storageError && <p className="storage-warning" role="alert">{storageError}</p>}
    {view === 'map' && <>
      <section className="valley-world"><div className="valley-heading"><p>Een nieuw avontuur voor {progress.name}</p><h1>De Magische Klokkenvallei</h1></div><ClockValleyScene /><div className="valley-friend"><UnicornAvatar unicorn={progress.unicorn} scenery={false} /></div></section>
      <div className="valley-level"><span>🌼 {CLOCK_LEVELS[level - 1]}</span><span>{progress.availableXp} XP beschikbaar</span></div>
      <section className="valley-destinations" aria-label="Kies je avontuur">
        <button className="valley-destination" onClick={() => start('choice')}><span aria-hidden="true">🕒</span><strong>Welke tijd is het?</strong><small>Kijk naar de klok</small></button>
        <button className="valley-destination" onClick={() => start('setter')}><span aria-hidden="true">⏰</span><strong>Zet de klok goed!</strong><small>Jij draait de wijzers</small></button>
        <button className="valley-destination" onClick={() => setView('missions')}><span aria-hidden="true">🌈</span><strong>Eenhoornmissies</strong><small>Op avontuur met Luna</small></button>
        <button className="valley-destination" onClick={() => setView('stable')}><span aria-hidden="true">🦄</span><strong>Mijn eenhoornstal</strong><small>{progress.unicorn.kind ? progress.unicorn.name : 'Kies jouw vriendje'}</small></button>
      </section>
      <button className="valley-lesson-link secondary-button" onClick={() => setView('tutorial')}>✦ Naar Sterretjes klokkenles</button>
    </>}
    {view === 'stable' && <UnicornStable progress={progress} setProgress={setProgress} />}
    {view === 'tutorial' && <ClockTutorial />}
    {view === 'missions' && <section className="clock-missions"><h1>De Eenhoornmissies</h1><button className="primary-button" onClick={() => startMission(chooseMission(progress.clock.missionCounts))}>🦄 Kies een avontuur voor mij</button><div className="clock-mission-list">{CLOCK_MISSIONS.map((entry, index) => <button key={entry.title} className="clock-mission" onClick={() => startMission(index)}><span aria-hidden="true">{['🌈', '🪄', '🍓', '🌟', '💧', '🦋', '🌸', '🌙', '🎵', '☁️'][index]}</span><strong>{entry.title}</strong><small>{progress.clock.missionCounts[index] ? `${progress.clock.missionCounts[index]} keer voltooid` : '6 kleine opdrachten'}</small></button>)}</div></section>}
    {playing && finished && <section className="clock-finished"><UnicornAvatar unicorn={progress.unicorn} celebrate /><h1>Missie geslaagd, {progress.name}!</h1><p>{story.ending}</p><strong>+30 bonus-XP</strong><p role="status">{feedback}</p><div className="button-row"><button className="primary-button" onClick={() => startMission(chooseMission(progress.clock.missionCounts, mission))}>Volgend avontuur →</button><button className="secondary-button" onClick={() => setView('stable')}>🦄 Naar mijn eenhoorn</button></div></section>}
    {playing && !finished && <section className="clock-exercise">
      {view === 'mission' && <div className="clock-mission-progress"><strong>{story.title}</strong><span>Opdracht {step + 1} van {MISSION_LENGTH}</span><progress max={MISSION_LENGTH} value={step + Number(correct)} /></div>}
      <div className="clock-question-heading"><h1>{prompt}</h1><button className="clock-speak" title={voice && progress.sound ? 'Lees de opdracht voor' : 'Voorlezen vereist geluid en een Nederlandse apparaatstem'} aria-label="Lees de opdracht voor" disabled={!voice || !progress.sound} onClick={speak}>🔊</button></div>
      <div className="clock-exercise-layout"><div className="clock-workspace">{view === 'mission' && mode === 'choice' ? <UnicornAvatar unicorn={progress.unicorn} /> : <AnalogClock time={mode === 'choice' ? target : time} onChange={mode === 'setter' && !correct ? setTime : undefined} highlight={hints >= 2 || level === 1} guideTime={hints >= 2 ? target : undefined} />}
        <div className="clock-legend"><span className="hour-label">Kort · uur</span><span className="minute-label">Lang · minuten</span></div>
      </div><div className="clock-answer-area">
        {mode === 'choice' ? <div className={`clock-options ${view === 'mission' ? 'clock-picture-options' : ''}`}>{options.map((option, index) => <button key={option} className={`clock-option ${selected === option ? correct ? 'correct' : 'try-again' : ''}`} aria-pressed={selected === option} aria-label={view === 'mission' ? `Klok ${String.fromCharCode(65 + index)}` : undefined} disabled={correct} onClick={() => submit(option)}><span>{String.fromCharCode(65 + index)}</span>{view === 'mission' ? <AnalogClock time={option} /> : formatTime(option)}</button>)}</div> : <><ClockControls disabled={correct} onStep={(delta) => setTime((current) => shiftTime(current, delta))} /><button className="primary-button clock-check" disabled={correct} onClick={() => submit(time)}>Controleer mijn klok! ✨</button></>}
        <div className="clock-feedback" role="status">{feedback && <p className={correct ? 'feedback-good' : 'feedback-try'}>{feedback}</p>}</div>
        {correct ? <button className="primary-button" onClick={next}>Volgende klok →</button> : <button className="hint-button" disabled={hints >= 3} onClick={() => setHints((current) => Math.min(3, current + 1))}>💡 {hints === 0 ? 'Sterretje, help mij' : hints === 1 ? 'Laat een aanwijzing zien' : hints === 2 ? 'Laat de wijzers zien' : 'Samen bekeken'}</button>}
        {hints > 0 && <aside className="clock-hint"><strong>Sterretje helpt</strong><p>{hints === 1 ? 'Kijk eerst naar de lange blauwe wijzer. Staat hij op 12, 3, 6 of 9? Bekijk daarna de korte roze wijzer.' : clockTip(target)}</p>
          {hints >= 2 && <div className="clock-hint-position">Lange wijzer → {target % 4 === 0 ? 12 : target % 4 * 3}</div>}
          {hints === 3 && <div className="clock-demonstration"><AnalogClock time={target} highlight label={`Voorbeeld: ${formatTime(target)}`} /><strong>{formatTime(target)}</strong>{mode === 'setter' && <p>Jouw klok: {formatTime(time)}</p>}</div>}
        </aside>}
        {correct && progress.clock.answered % 4 === 0 && <p className="clock-joke">😄 {CLOCK_JOKES[(Math.floor(progress.clock.answered / 4) - 1) % CLOCK_JOKES.length]}</p>}
      </div></div>
    </section>}
  </main>;
}
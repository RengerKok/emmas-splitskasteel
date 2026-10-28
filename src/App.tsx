import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addXp, createProblem, defaultProgress, getLevel, loadProgress, makeChoices, nextJoke, OUTFITS, problemKey, PRAISE, recordAnswer, STORAGE_KEY } from './game';
import Princess from './Princess';
import OutfitArt from './OutfitArt';
import TreasureResults, { TreasureRecord } from './TreasureResults';
import { pauseTreasureClock, remainingTime, resumeTreasureClock, saveTreasureRound, startTreasureClock, TREASURE_SECONDS } from './treasure';
import type { Level, Mode, OutfitCategory, Problem, Progress, TreasureAttempt, TreasureRound } from './types';

type Screen = 'home' | 'play' | 'wardrobe' | 'parent' | 'treasure-results';
const MODES: { id: Mode; title: string; subtitle: string; icon: string; color: string }[] = [
  { id: 'tower', title: 'Rekentoren', subtitle: 'Vul de splitsing in', icon: '🏰', color: 'lilac' },
  { id: 'magic', title: 'Toverkamer', subtitle: 'Kies het juiste antwoord', icon: '🪄', color: 'blue' },
  { id: 'garden', title: 'Magische tuin', subtitle: 'Verdeel de sterren', icon: '🌷', color: 'green' },
  { id: 'mission', title: 'Prinsessenmissie', subtitle: 'Help prinses Lila op avontuur', icon: '🦄', color: 'pink' },
  { id: 'treasure', title: 'Schatkamer', subtitle: 'Een schattenjacht van 2 minuten', icon: '💎', color: 'gold' },
];
const MISSIONS = [
  { title: 'Prinses Lila en het koninklijke bal', task: 'Help Lila haar kroon te vinden voor het bal.', ending: 'Prinses Lila heeft haar kroon gevonden en straalt op het bal!' },
  { title: 'Eenhoorn Nova en de sterrenbrug', task: 'Help Nova genoeg sterren te verzamelen voor de brug.', ending: 'Nova galoppeert over de fonkelende sterrenbrug!' },
  { title: 'De draak en de verdwenen vuurparels', task: 'Help draakje Vonk de vuurparels terug te vinden.', ending: 'Vonk heeft alle vuurparels terug en kan weer zachtjes gloeien!' },
  { title: 'Het bloemenfeest van de fee', task: 'Help de fee genoeg bloemen klaar te zetten voor het feest.', ending: 'Het bloemenfeest is prachtig geworden. Iedereen danst mee!' },
];
const VISUALS = ['⭐', '💎', '🌸', '👑', '🍎', '✨'];

function randomPraise() {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)];
}

function makeProgressProblem(progress: Progress, visual = false): Problem {
  const level = getLevel(progress);
  if (progress.tricky.length && Math.random() < 0.45) {
    const total = progress.tricky[Math.floor(Math.random() * progress.tricky.length)];
    const known = Math.floor(Math.random() * (total + 1));
    return { total, known, answer: total - known, missing: Math.random() < 0.5 ? 'left' : 'right', visual };
  }
  return createProblem(level, Math.random, visual);
}

function App() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      return loadProgress(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      console.error('De opgeslagen voortgang kon niet worden gelezen.', error);
      return defaultProgress();
    }
  });
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<Mode>('tower');
  const [problem, setProblem] = useState<Problem>(() => makeProgressProblem(defaultProgress()));
  const [choices, setChoices] = useState<number[]>([]);
  const [entry, setEntry] = useState('');
  const [basket, setBasket] = useState(0);
  const [hints, setHints] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TREASURE_SECONDS);
  const treasureClock = useRef(startTreasureClock(0));
  const treasureAttempts = useRef<TreasureAttempt[]>([]);
  const lastSubmittedProblem = useRef<Problem | null>(null);
  const [treasureCount, setTreasureCount] = useState(0);
  const [treasureResult, setTreasureResult] = useState<TreasureRound | null>(null);
  const [missionStep, setMissionStep] = useState(0);
  const [missionStory, setMissionStory] = useState(MISSIONS[0]);
  const [gameOver, setGameOver] = useState(false);
  const [joke, setJoke] = useState(() => nextJoke());
  const [lastJoke, setLastJoke] = useState('');
  const [notice, setNotice] = useState('');
  const [errorText, setErrorText] = useState(() => {
    try {
      loadProgress(localStorage.getItem(STORAGE_KEY));
      return '';
    } catch {
      return 'De opgeslagen voortgang was beschadigd. Er is een nieuwe voortgang gestart.';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('De voortgang kon niet op dit apparaat worden bewaard.', error);
      setErrorText('Opslaan lukt niet. Controleer de beschikbare opslagruimte op dit apparaat.');
    }
  }, [progress]);

  const finishTreasure = useCallback((now: number) => {
    if (treasureClock.current.finished) return;
    treasureClock.current = { remainingMs: 0, deadline: null, finished: true };
    const round: TreasureRound = { completedAt: new Date(now).toISOString(), attempts: [...treasureAttempts.current] };
    setSecondsLeft(0);
    setGameOver(true);
    setTreasureResult(round);
    setProgress((current) => saveTreasureRound(current, round));
  }, []);

  useEffect(() => {
    if (screen !== 'play' || mode !== 'treasure' || paused || gameOver) return undefined;
    const timer = window.setInterval(() => {
      const now = Date.now();
      const remaining = remainingTime(treasureClock.current, now);
      setSecondsLeft(Math.ceil(remaining / 1000));
      if (remaining === 0) finishTreasure(now);
    }, 200);
    return () => window.clearInterval(timer);
  }, [screen, mode, paused, gameOver, finishTreasure]);

  const accuracy = progress.solved ? Math.round((progress.correct / progress.solved) * 100) : 0;
  const availableReward = useMemo(() => OUTFITS.find((item) => item.id === progress.lastRewardId), [progress.lastRewardId]);

  function setSaved(update: (current: Progress) => Progress) {
    setProgress((current) => update(current));
  }

  function begin(nextMode: Mode) {
    setMode(nextMode);
    setScreen('play');
    setPaused(false);
    setGameOver(false);
    setMissionStep(0);
    setMissionStory(MISSIONS[Math.floor(Math.random() * MISSIONS.length)]);
    setSecondsLeft(TREASURE_SECONDS);
    treasureClock.current = startTreasureClock(Date.now());
    treasureAttempts.current = [];
    lastSubmittedProblem.current = null;
    setTreasureCount(0);
    setTreasureResult(null);
    setFeedback('');
    setIsCorrect(false);
    newProblem(nextMode);
  }

  function newProblem(nextMode = mode, currentProgress = progress) {
    const next = makeProgressProblem(currentProgress, nextMode === 'garden' || getLevel(currentProgress) === 1);
    if (nextMode === 'treasure' && problemKey(next) === problemKey(problem)) {
      next.known = (next.known + 1) % (next.total + 1);
      next.answer = next.total - next.known;
    }
    setProblem(next);
    setChoices(makeChoices(next));
    setEntry('');
    setBasket(0);
    setHints(0);
    setFeedback('');
    setIsCorrect(false);
  }

  function submit(answer: number) {
    if (isCorrect || gameOver || paused) return;
    if (mode === 'treasure') {
      const now = Date.now();
      if (remainingTime(treasureClock.current, now) === 0) {
        finishTreasure(now);
        return;
      }
      if (lastSubmittedProblem.current === problem) return;
      lastSubmittedProblem.current = problem;
      const result = recordAnswer(progress, problem, answer, hints);
      treasureAttempts.current.push({ problem: { ...problem }, given: answer, xp: result.xp });
      setTreasureCount(treasureAttempts.current.length);
      setProgress(result.progress);
      if (result.correct && progress.sound) playChime();
      newProblem(mode, result.progress);
      return;
    }
    setSaved((current) => recordAnswer(current, problem, answer, hints).progress);
    if (answer !== problem.answer) {
      setFeedback(hints === 0 ? 'Bijna! Kijk nog eens goed en probeer het opnieuw. 💖' : 'Je bent dichtbij! Tel rustig verder. ✨');
      setIsCorrect(false);
      setEntry('');
      return;
    }
    setIsCorrect(true);
    const alreadyRewarded = progress.rewardedProblems.includes(problemKey(problem));
    const awarded = alreadyRewarded ? 0 : hints === 0 ? 10 : 6;
    setFeedback(`${randomPraise()}${awarded ? ` +${awarded} XP` : ''}`);
    if (progress.sound) playChime();
    if ((progress.correct + 1) % 4 === 0) {
      const next = nextJoke(lastJoke);
      setLastJoke(next);
      setJoke(next);
    }
  }

  function toggleTreasurePause() {
    const now = Date.now();
    if (remainingTime(treasureClock.current, now) === 0) {
      finishTreasure(now);
      return;
    }
    treasureClock.current = paused
      ? resumeTreasureClock(treasureClock.current, now)
      : pauseTreasureClock(treasureClock.current, now);
    setSecondsLeft(Math.ceil(remainingTime(treasureClock.current, now) / 1000));
    setPaused((value) => !value);
  }

  function playChime() {
    try {
      const context = new window.AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.22);
      oscillator.onended = () => void context.close();
    } catch (error) {
      console.error('Het geluidje kon niet worden afgespeeld.', error);
    }
  }

  function advance() {
    if (mode === 'mission' && missionStep === 4) {
      setSaved((current) => addXp(current, 25));
      setFeedback(`${missionStory.ending} +25 bonus-XP! ${randomPraise()}`);
      setGameOver(true);
      return;
    }
    if (mode === 'mission') setMissionStep((step) => step + 1);
    newProblem();
  }

  function showHint() {
    setHints((count) => Math.min(count + 1, 3));
    const nextHint = hints + 1;
    if (nextHint === 1) setFeedback(`Je hebt ${problem.total} ${mode === 'garden' ? 'sterren' : 'magische punten'} nodig en je hebt er al ${problem.known}. Hoeveel ontbreken er nog?`);
    else if (nextHint === 2) setFeedback(`Kijk naar de groep: ${problem.known} en nog ${problem.answer} samen maken ${problem.total}.`);
    else setFeedback(`Denk aan ${problem.total} − ${problem.known}. Je kunt het!`);
  }

  function startNext() {
    if (gameOver) {
      setScreen('home');
      return;
    }
    advance();
  }

  function renderProblem() {
    const leftValue = problem.missing === 'left' ? (isCorrect ? problem.answer : '?') : problem.known;
    const rightValue = problem.missing === 'right' ? (isCorrect ? problem.answer : '?') : problem.known;
    return (
      <div className={`equation-card ${mode === 'garden' ? 'garden-card' : ''}`}>
        <div className="total-orb">{problem.total}</div>
        <div className="equation-label">splits in twee groepjes</div>
        <div className="split-line"><span /> <span /></div>
        <div className="split-boxes">
          <div className="split-box">{leftValue}</div><span className="plus">+</span><div className="split-box">{rightValue}</div>
        </div>
        {problem.visual && <div className="counter-objects" aria-label={`${problem.total} magische voorwerpen`}>
          {Array.from({ length: problem.total }, (_, index) => <span key={index} className={index < problem.known ? 'known-object' : ''}>{VISUALS[(problem.total + index) % VISUALS.length]}</span>)}
        </div>}
      </div>
    );
  }

  function exportProgress() {
    const file = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'emma-splitskasteel-voortgang.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('Je voortgangsbestand is gedownload.');
  }

  async function importProgress(file?: File) {
    if (!file) return;
    try {
      const restored = loadProgress(await file.text());
      setProgress(restored);
      setNotice('De voortgang is veilig teruggezet. ✨');
      setErrorText('');
    } catch (error) {
      setErrorText(error instanceof Error ? `Importeren is niet gelukt: ${error.message}` : 'Importeren is niet gelukt.');
    }
  }

  if (screen === 'parent') {
    return <main className="app-shell parent-shell">
      <header className="topbar"><button className="back-button" onClick={() => { setScreen('home'); setErrorText(''); }}>← Terug</button><div className="brand-mini">🛡️ Ouderhoek</div><div className="xp-pill">✨ {progress.xp} XP</div></header>
      <section className="parent-content">
        <p className="eyebrow">ALLEEN OP DIT APPARAAT</p><h1>Emma's voortgang</h1>
        <div className="stats-grid">
          <div className="stat-card"><strong>{progress.solved}</strong><span>pogingen</span></div>
          <div className="stat-card"><strong>{accuracy}%</strong><span>goed beantwoord</span></div>
          <div className="stat-card"><strong>{progress.tricky.length ? progress.tricky.join(', ') : '—'}</strong><span>getallen om te oefenen</span></div>
        </div>
        <div className="settings-card">
          <label>Naam van de prinses<input value={progress.name} maxLength={20} onChange={(event) => setSaved((old) => ({ ...old, name: event.target.value }))} onBlur={() => {
            if (!progress.name.trim()) setSaved((old) => ({ ...old, name: 'Emma' }));
          }} /></label>
          <label>Moeilijkheid<select value={progress.selectedLevel} onChange={(event) => setSaved((old) => ({ ...old, selectedLevel: event.target.value === 'auto' ? 'auto' : Number(event.target.value) as Level }))}>
            <option value="auto">Automatisch aanpassen</option><option value="1">Beginnende prinses (tot 10)</option><option value="2">Slimme prinses (tot 15)</option><option value="3">Rekenkoningin (tot 20)</option>
          </select></label>
          <p>💎 De Schatkamer duurt altijd 2 minuten. Elk bevestigd antwoord gaat direct door naar de volgende som. Het record telt het aantal goede antwoorden.</p>
          <label className="check-label"><input type="checkbox" checked={progress.sound} onChange={(event) => setSaved((old) => ({ ...old, sound: event.target.checked }))} /> Geluid aan</label>
          <label className="check-label"><input type="checkbox" checked={progress.timerEnabled} onChange={(event) => setSaved((old) => ({ ...old, timerEnabled: event.target.checked }))} /> Schatkamer beschikbaar</label>
        </div>
        <TreasureRecord highscore={progress.treasureHighscore} />
        {progress.lastTreasureRound && <button className="secondary-button" onClick={() => setScreen('treasure-results')}>📖 Bekijk het laatste schattenboek</button>}
        <div className="settings-card">
          <h2>Voortgang meenemen</h2><p>Bewaar een kopie om je voortgang later terug te zetten.</p>
          <div className="button-row"><button className="secondary-button" onClick={exportProgress}>⬇️ Exporteer JSON</button><label className="secondary-button file-button">⬆️ Importeer JSON<input type="file" accept="application/json,.json" onChange={(event) => void importProgress(event.target.files?.[0])} /></label></div>
          {notice && <p className="success-text">{notice}</p>}{errorText && <p className="error-text" role="alert">{errorText}</p>}
        </div>
        <div className="settings-card"><h2>Beloningen</h2><p>{progress.unlocked.length} van {OUTFITS.length} kledingstukken vrijgespeeld</p>
          <div className="unlocked-list">{OUTFITS.map((item) => <span key={item.id} className={progress.unlocked.includes(item.id) ? '' : 'locked'}><OutfitArt item={item} /> {item.name}</span>)}</div>
        </div>
        <button className="danger-button" onClick={() => {
          if (window.confirm('Weet je zeker dat je alle voortgang en beloningen wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
            setProgress(defaultProgress()); setNotice('Alle voortgang is opnieuw gestart.'); setErrorText('');
          }
        }}>🔄 Begin opnieuw</button>
      </section>
    </main>;
  }

  if (screen === 'wardrobe') {
    const categories: { id: OutfitCategory; title: string }[] = [
      { id: 'dress', title: 'Jurken' }, { id: 'shoes', title: 'Schoenen' }, { id: 'crown', title: 'Kroontjes' },
      { id: 'hair', title: 'Haar' }, { id: 'wand', title: 'Toverstaven' }, { id: 'wings', title: 'Vleugels' },
    ];
    return <main className="app-shell wardrobe-shell"><header className="topbar"><button className="back-button" onClick={() => setScreen('home')}>← Terug</button><div className="brand-mini">👗 Kleedkamer</div><div className="xp-pill">✨ {progress.xp} XP</div></header>
      <section className="wardrobe-layout"><div className="princess-stage"><p className="eyebrow">HET KONINKLIJKE ATELIER</p><Princess outfit={progress.outfit} /><div className="sparkle sparkle-one" aria-hidden="true">✦</div><div className="sparkle sparkle-two" aria-hidden="true">✧</div><h2>Jouw magische prinses</h2><p className="stage-caption">Een beetje glans, helemaal van jou.</p></div>
        <div className="wardrobe-items"><h1>Kies je outfit</h1><p>Tik op een vrijgespeeld kledingstuk om het aan te trekken.</p>
          {categories.map((category) => <div className="wardrobe-category" key={category.id}><h2>{category.title}</h2><div className="wardrobe-grid">{OUTFITS.filter((item) => item.category === category.id).map((item) => {
            const unlocked = progress.unlocked.includes(item.id);
            return <button key={item.id} className={`wardrobe-item ${progress.outfit[category.id] === item.id ? 'selected' : ''} ${unlocked ? '' : 'locked'}`} aria-label={`${item.name}, ${unlocked ? progress.outfit[category.id] === item.id ? 'aangetrokken' : 'trek aan' : `${item.cost} XP nodig`}`} aria-pressed={progress.outfit[category.id] === item.id} disabled={!unlocked} onClick={() => setSaved((old) => ({ ...old, outfit: { ...old.outfit, [category.id]: item.id } }))}>
              <OutfitArt item={item} /><span>{item.name}</span>{unlocked ? <small>{progress.outfit[category.id] === item.id ? '✓ Aangetrokken' : 'Trek aan'}</small> : <small>🔒 {item.cost} XP</small>}
            </button>;
          })}</div></div>)}
        </div>
      </section>
    </main>;
  }

  const displayedRound = screen === 'treasure-results' ? progress.lastTreasureRound : treasureResult;
  if ((screen === 'treasure-results' || (screen === 'play' && mode === 'treasure' && gameOver)) && displayedRound) {
    return <main className="app-shell">
      <header className="topbar"><button className="back-button" onClick={() => setScreen('home')}>← Kasteel</button><div className="brand-mini">💎 Schatkamer</div><div className="xp-pill">✨ {progress.xp} XP</div></header>
      {errorText && <p className="storage-warning" role="alert">{errorText}</p>}
      <TreasureResults round={displayedRound} highscore={progress.treasureHighscore} name={progress.name}
        onReplay={() => begin('treasure')} onHome={() => setScreen('home')} />
    </main>;
  }

  if (screen === 'play') {
    const timeLabel = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;
    return <main className="app-shell play-shell">
      <header className="topbar"><button className="back-button" onClick={() => setScreen('home')}>← Kasteel</button><div className="brand-mini">{MODES.find((item) => item.id === mode)?.icon} {MODES.find((item) => item.id === mode)?.title}</div><div className="xp-pill">✨ {progress.xp} XP</div></header>
      <section className="play-content">
        {mode === 'mission' && <div className="mission-progress"><span>{missionStory.title}</span><strong>Opdracht {Math.min(missionStep + 1, 5)} van 5</strong><p>{missionStory.task}</p><div><i style={{ width: `${(missionStep / 5) * 100}%` }} /></div></div>}
        {mode === 'treasure' && <div className="timer-row treasure-timer"><span>💎 {treasureCount} {treasureCount === 1 ? 'antwoord' : 'antwoorden'} bewaard</span><strong role="timer" aria-label="Resterende tijd">{timeLabel}</strong><button className="pause-button" onClick={toggleTreasurePause}>{paused ? '▶ Verder' : 'Ⅱ Pauze'}</button></div>}
        {paused ? <div className="pause-card"><span>⏸️</span><h1>Even pauze</h1><p>De tijd staat stil. Rustig aan, {progress.name}!</p><button className="primary-button" onClick={toggleTreasurePause}>Verder spelen</button></div> :
          <>{!gameOver && <div className="play-workspace">
            {renderProblem()}
            <div className="play-answer">
            {!gameOver && mode === 'magic' && <div className="choices-grid">{choices.map((choice, index) => <button key={`${choice}-${index}`} className="choice-button" onClick={() => submit(choice)} disabled={isCorrect}>{String.fromCharCode(65 + index)}. <strong>{choice}</strong></button>)}</div>}
            {!gameOver && mode === 'garden' && <div className="garden-controls"><p>Tik op een voorwerp om het naar het linker mandje te verplaatsen.</p><div className="baskets"><button onClick={() => setBasket((count) => Math.min(count + 1, problem.total))} disabled={basket >= problem.total}>🧺 Links <b>{basket}</b><span>➕ Voorwerp erbij</span></button><button onClick={() => setBasket((count) => Math.max(count - 1, 0))} disabled={basket <= 0}>🧺 Terug <b>{problem.total - basket}</b><span>↩️ Voorwerp terug</span></button></div><button className="primary-button" onClick={() => submit(problem.total - basket)}>Klaar met verdelen</button></div>}
            {!gameOver && mode !== 'magic' && mode !== 'garden' && <div className="answer-panel"><div className="answer-display" aria-live="polite">{entry || 'Jouw antwoord'}</div><div className="number-pad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 'wis', 0, '⌫'].map((number, index) => <button key={`${number}-${index}`} onClick={() => number === 'wis' ? setEntry('') : number === '⌫' ? setEntry((old) => old.slice(0, -1)) : setEntry((old) => old.length < 2 ? `${old}${number}` : old)} aria-label={number === 'wis' ? 'Wissen' : number === '⌫' ? 'Laatste cijfer wissen' : `Cijfer ${number}`}>{number === 'wis' ? 'Wis' : number}</button>)}</div><button className="primary-button" onClick={() => entry !== '' && submit(Number(entry))} disabled={!entry}>Controleer ✨</button></div>}
            </div>
          </div>}
            {feedback && <div className={`feedback ${isCorrect || gameOver ? 'feedback-good' : 'feedback-try'}`} role="status"><span>{isCorrect || gameOver ? '🌟' : '💖'}</span><p>{feedback}</p></div>}
            {!gameOver && !isCorrect && mode !== 'magic' && mode !== 'garden' && <button className="hint-button" onClick={showHint}>💡 Geef me een hint · stap {Math.min(hints + 1, 3)}</button>}
            {!gameOver && !isCorrect && (mode === 'magic' || mode === 'garden') && <button className="hint-button" onClick={showHint}>💡 Geef me een hint</button>}
            {hints > 0 && !isCorrect && <button className="explain-button" onClick={() => setFeedback(`Uitleg: ${problem.total} bestaat uit ${problem.known} en ${problem.answer}. Samen zijn dat ${problem.total}!`)}>📖 Leg het uit</button>}
            {(isCorrect || gameOver) && <button className="primary-button next-button" onClick={startNext}>{gameOver ? 'Terug naar het kasteel' : mode === 'mission' && missionStep === 4 ? 'Voltooi de missie 🎉' : 'Volgende som →'}</button>}
            {mode === 'garden' && problem.visual && <div className="garden-dots" aria-label="Tik op voorwerpen om ze te verdelen">{Array.from({ length: problem.total }, (_, index) => <button key={index} className={index < basket ? 'in-basket' : ''} aria-label={`Verplaats voorwerp ${index + 1} ${index < basket ? 'terug' : 'naar links'}`} onClick={() => setBasket((count) => index < count ? index : index + 1)} disabled={isCorrect}>{VISUALS[(problem.total + index) % VISUALS.length]}</button>)}</div>}
            {isCorrect && (progress.correct + 1) % 5 === 0 && <div className="joke-card">😄 {joke}</div>}
          </>}
        {mode === 'treasure' && <p className="treasure-instruction">Na Controleer komt meteen de volgende som. Je antwoorden bekijk je straks in je schattenboek.</p>}
        {errorText && <p className="storage-warning" role="alert">{errorText}</p>}
      </section>
    </main>;
  }

  return <main className="app-shell home-shell">
    <header className="topbar"><div className="brand-mini">✨ Emma's Magische Splitskasteel</div><div className="top-actions"><div className="xp-pill">👑 {progress.xp} XP</div><button className="settings-button" aria-label="Ouderhoek openen" onClick={() => setScreen('parent')}>⚙️</button></div></header>
    <div className="home-hero">
      <div className="hero-copy"><p className="eyebrow">WELKOM TERUG, {progress.name.toUpperCase()}!</p><h1>Een magisch avontuur<br />vol getallenschat</h1><p>Splits getallen, verzamel sterren en kleed je prinses aan.</p><div className="hero-buttons"><button className="primary-button" onClick={() => begin('tower')}>▶ Begin met spelen</button><button className="wardrobe-link" onClick={() => setScreen('wardrobe')}>👗 Mijn kleedkamer</button></div></div>
      <div className="hero-castle" aria-hidden="true"><div className="moon">☾</div><div className="castle">🏰</div><div className="rainbow">🌈</div><div className="hero-princess"><Princess outfit={progress.outfit} small /></div><span className="floating-star star-a">✦</span><span className="floating-star star-b">✧</span><span className="floating-star star-c">✨</span></div>
    </div>
    <section className="mode-section"><div className="section-heading"><div><p className="eyebrow">KIES JE AVONTUUR</p><h2>Waar gaan we heen?</h2></div><div className="level-chip">🌱 {progress.selectedLevel === 'auto' ? 'Niveau ' + getLevel(progress) : `Niveau ${progress.selectedLevel}`}</div></div>
      <div className="mode-grid">{MODES.filter((item) => item.id !== 'treasure' || progress.timerEnabled).map((item) => <button key={item.id} className={`mode-card ${item.color}`} onClick={() => begin(item.id)}><span className="mode-icon">{item.icon}</span><span className="mode-text"><strong>{item.title}</strong><small>{item.subtitle}</small></span><span className="mode-arrow">→</span></button>)}</div>
    </section>
    {progress.timerEnabled && <section className="home-treasure">
      <TreasureRecord highscore={progress.treasureHighscore} />
      {progress.lastTreasureRound && <button className="secondary-button" onClick={() => setScreen('treasure-results')}>📖 Mijn schattenboek</button>}
    </section>}
    <section className="home-bottom"><div className="progress-card"><span>🌟</span><div><strong>Jouw sterrenreis</strong><small>{progress.correct} sommen goed · {progress.unlocked.length} beloningen</small></div><div className="progress-track"><i style={{ width: `${Math.min(100, (progress.xp % 100))}%` }} /></div></div><div className="joke-home"><span>😄</span><p>{joke}</p><button aria-label="Nieuw grapje" onClick={() => { const next = nextJoke(joke); setJoke(next); setLastJoke(next); }}>🎲</button></div></section>
    {availableReward && <div className="reward-banner" role="status"><OutfitArt item={availableReward} /><div><strong>Joepie {progress.name}! Nieuwe beloning!</strong><p>{availableReward.name} is vrijgespeeld!</p></div><button onClick={() => { setSaved((old) => ({ ...old, lastRewardId: undefined })); setScreen('wardrobe'); }}>Bekijk 👗</button><button className="close-reward" aria-label="Sluiten" onClick={() => setSaved((old) => ({ ...old, lastRewardId: undefined }))}>×</button></div>}
    {errorText && <div className="storage-warning" role="alert">{errorText}</div>}
    <footer>Alle magie blijft veilig op dit apparaat. 💜</footer>
  </main>;
}

export default App;

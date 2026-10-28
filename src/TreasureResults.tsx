import { summarizeTreasure } from './treasure';
import type { TreasureHighscore, TreasureRound } from './types';

export function TreasureRecord({ highscore }: { highscore: TreasureHighscore | null }) {
  return <div className="treasure-record">
    <span aria-hidden="true">🏆</span>
    <div><strong>Jouw koninklijke record</strong>
      {highscore
        ? <p>{highscore.correct} goed in 2 minuten · <time dateTime={highscore.achievedAt}>{formatDate(highscore.achievedAt)}</time></p>
        : <p>Voltooi een schattenjacht en verdien je eerste record!</p>}
    </div>
  </div>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' });
}

interface Props {
  round: TreasureRound;
  highscore: TreasureHighscore | null;
  name: string;
  onReplay: () => void;
  onHome: () => void;
}

export default function TreasureResults({ round, highscore, name, onReplay, onHome }: Props) {
  const { correct, wrong, xp } = summarizeTreasure(round);
  const isRecord = highscore?.achievedAt === round.completedAt;
  return <section className="treasure-results" aria-labelledby="treasure-title">
    <div className="treasure-celebration" aria-hidden="true">✨ 👑 💎 ✨</div>
    <p className="eyebrow">JOUW SCHATTENBOEK</p>
    <h1 id="treasure-title">{isRecord && correct > 0 ? 'Een koninklijk record!' : 'Je schattenjacht is klaar!'}</h1>
    <p>Goed geoefend, {name}! Elke poging maakt je rekenmagie sterker.</p>
    <p className="round-date">Ronde van 2 minuten · <time dateTime={round.completedAt}>{formatDate(round.completedAt)}</time></p>
    <div className="stats-grid">
      <div className="stat-card"><strong>💎 {correct}</strong><span>goed beantwoord</span></div>
      <div className="stat-card"><strong>🌱 {wrong}</strong><span>fout · nog even oefenen</span></div>
      <div className="stat-card"><strong>✨ {xp}</strong><span>XP verdiend</span></div>
    </div>
    <TreasureRecord highscore={highscore} />
    <div className="treasure-actions">
      <button className="primary-button" onClick={onReplay}>Nieuwe schattenjacht 💎</button>
      <button className="secondary-button" onClick={onHome}>Terug naar het kasteel</button>
    </div>
    <h2>Jouw magische antwoorden</h2>
    <p>De ingevulde vakjes laten jouw antwoorden zien. Bij een fout staat de juiste splitsing erbij.</p>
    {round.attempts.length === 0
      ? <p className="treasure-empty">Nog geen antwoorden deze ronde. Je schatkist wacht op een nieuw avontuur!</p>
      : <ol className="treasure-answer-list">
        {round.attempts.map(({ problem, given }, index) => {
          const right = given === problem.answer;
          return <li key={index} className={right ? 'treasure-answer-good' : 'treasure-answer-practice'}>
            <div className="treasure-answer-heading">
              <span>{right ? '💎 Goed!' : '🌱 Nog oefenen'}</span><small>Som {index + 1}</small>
            </div>
            <p className="treasure-equation">
              {problem.total} = {problem.missing === 'left' ? <mark>{given}</mark> : problem.known}
              {' + '}{problem.missing === 'right' ? <mark>{given}</mark> : problem.known}
            </p>
            {!right && <p className="treasure-solution">Zo klopt het: {problem.total} = {problem.missing === 'left' ? problem.answer : problem.known}
              {' + '}{problem.missing === 'right' ? problem.answer : problem.known}</p>}
          </li>;
        })}
      </ol>}
  </section>;
}

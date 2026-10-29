import { clockTime } from './clock';

export const CLOCK_MISSIONS = [
  { title: 'Luna en het regenboogfeest', prompt: 'Luna wil op tijd bij het regenboogfeest zijn. Het feest begint om', time: clockTime(3), ending: 'Luna danst onder alle kleuren van de regenboog!' },
  { title: 'De verdwenen toverstaf', prompt: 'Sterretje zoekt haar toverstaf. De toverstaf verschijnt om', time: clockTime(4, 30), ending: 'De toverstaf is terug! Sterretje tovert bloemen voor jou.' },
  { title: 'De eenhoornpicknick', prompt: 'Regenboog heeft een mand vol aardbeien. De picknick begint om', time: clockTime(12, 15), ending: 'Alle eenhoorns smullen samen in het gras!' },
  { title: 'Het magische sterrenfeest', prompt: 'Luna steekt de sterrenlichtjes aan. Het sterrenfeest begint om', time: clockTime(7, 45), ending: 'Duizend kleine sterren schitteren voor jou!' },
  { title: 'De zingende waterval', prompt: 'De waterval zingt een lied voor Sterretje. Het lied begint om', time: clockTime(6), ending: 'Het water zingt en Sterretje zingt vrolijk mee!' },
  { title: 'De vlinderpost', prompt: 'Regenboog brengt een brief naar de vlinders. De post vertrekt om', time: clockTime(9, 30), ending: 'Alle uitnodigingen zijn op tijd bezorgd!' },
  { title: 'De betoverde bloementuin', prompt: 'Luna wacht op de grootste bloem. Die gaat open om', time: clockTime(10, 15), ending: 'De tuin staat vol bloemen met gouden klokhartjes!' },
  { title: 'De maanlichtbrug', prompt: 'Sterretje helpt haar vrienden over de brug. De brug verschijnt om', time: clockTime(11, 45), ending: 'Iedereen is veilig aan de overkant. Dank je wel!' },
  { title: 'Het kloktorenconcert', prompt: 'Regenboog speelt op de klokken. Het concert begint om', time: clockTime(2), ending: 'Ding, dong! De hele vallei klapt voor jullie!' },
  { title: 'De grote dromenreis', prompt: 'Luna pakt haar zachte droomdeken. De dromenreis begint om', time: clockTime(8, 30), ending: 'De eenhoorns dromen van jouw volgende avontuur!' },
];

export const CLOCK_PRAISE = [
  'Wauw, jij bent een echte klokkenprinses!',
  'Luna hinnikt van plezier! Goed gedaan!',
  'Wat knap! Je weet precies hoe laat het is!',
  'De hele Klokkenvallei is trots op jou!',
  'Super! Je magische klok schittert!',
  'Wat goed dat je blijft proberen!',
  'Je hebt de wijzers goed bekeken!',
  'Sterretje doet een vrolijk dansje voor jou!',
  'Jij helpt de eenhoorns op tijd te komen!',
  'Een regenboog vol complimenten voor jou!',
  'Je hebt weer iets nieuws geleerd!',
  'Jouw klokmagie groeit elke dag!',
  'Wat heb jij rustig en goed nagedacht!',
  'Dat heb je prachtig uitgezocht!',
  'Je verdient een vrolijke eenhoornknuffel!',
  'Hoera! De klokkentoren luidt voor jou!',
  'Luna is blij met zo een slimme helper!',
  'De bloemen dansen van plezier!',
  'Jij ziet het verschil tussen de wijzers!',
  'Goed gekeken, goed gedaan!',
  'Elke oefening helpt je verder!',
  'Regenboog geeft je een fonkelende high five!',
  'Jouw doorzetten is echt bijzonder!',
  'De wijzers hebben voor jou geen geheimen meer!',
  'Een gouden ster voor jouw speurwerk!',
  'Jij maakt de Klokkenvallei een beetje vrolijker!',
];

export const CLOCK_JOKES = [
  'Waarom nam Luna een klok mee naar bed? Ze wilde op tijd dromen!',
  'Wat zegt een klok tegen een eenhoorn? Tijd om te hinniken!',
  'Waarom was de klok zo blij? Hij had een geweldige tijd!',
  'Waarom heeft Sterretje een wekker? Haar dromen duren altijd te lang!',
  'Wat eet een klok bij de picknick? Een kwart-taart!',
  'Waarom droeg Luna twee horloges? Dan had ze dubbel zoveel tijd!',
  'Wat doet een eenhoorn om twaalf uur? Een middag-hinnik!',
  'Waarom kan de klok niet klappen? Zijn handen zijn wijzers!',
  'Wat is het favoriete moment van een bloem? Bloeitijd!',
  'Waarom liep de wekker naar school? Hij wilde bij de tijd blijven!',
  'Wat zegt Regenboog als ze klaar is? Dat was een kleurrijke tijd!',
  'Waarom heeft de klok geen schoenen? Hij loopt toch wel!',
  'Waarom staat een klok graag in de tuin? Daar kan hij uren bloeien!',
  'Wat zegt Luna tegen een slome wijzer? Zet je beste wijzer voor!',
  'Waarom heeft de klok een ronde buik? Hij at de hele tijd!',
  'Hoe laat eet Sterretje een koekje? Als het koekjestijd is!',
  'Waarom houdt een klok van muziek? Hij tikt altijd mee!',
  'Wat zegt een kleine wijzer tegen een grote? Tot over een uurtje!',
  'Waarom nam de vlinder een horloge mee? Hij wilde de tijd laten vliegen!',
  'Wat zegt de klokkentoren bij het afscheid? Tot de volgende tik!',
];

export function chooseMission(counts: number[], previous = -1, random = Math.random): number {
  const candidates = CLOCK_MISSIONS.map((_, index) => index).filter((index) => index !== previous);
  const least = Math.min(...candidates.map((index) => counts[index] ?? 0));
  const available = candidates.filter((index) => (counts[index] ?? 0) === least);
  return available[Math.floor(random() * available.length)];
}
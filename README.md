# Emma's Magische Splitskasteel

Een gratis, Nederlandstalige oefen-PWA waarin Emma getallen van 1 tot en met 20 splitst. De app heeft geen account, advertenties, betaalde API of server nodig. De voortgang wordt lokaal in de browser bewaard.

## Lokaal starten

Installeer Node.js 20 of nieuwer. Open deze map in een terminal en voer uit:

```bash
npm install
npm run dev
```

Open de lokale URL die Vite toont. Een internetverbinding is nodig voor de eerste installatie van de pakketten. De app zelf bevat geen externe runtime-afhankelijkheden.

## Tests en productiebuild

```bash
npm test
npm run build
npm run preview
```

Vitest controleert de rekengenerator, antwoordopties, niveaus, XP-beloningen, de twee-minutenklok met pauze/hervatten, de antwoordweergave, highscores met datum en herstel van voortgangsbestanden. De build staat in `dist`.

## Publiceren via GitHub Pages

1. Maak een lege GitHub-repository en plaats de inhoud van deze projectmap erin.
2. Push de `main`-branch naar GitHub.
3. Open **Settings → Pages** in de repository en kies **GitHub Actions** als publicatiebron.
4. De workflow in `.github/workflows/deploy.yml` test en bouwt de app en publiceert daarna automatisch `dist`.
5. De Vite-configuratie gebruikt de naam van de GitHub-repository als basispad, zodat projectpagina's werken.

## Openen en toevoegen op iPad

1. Open de GitHub Pages-URL in Safari op de iPad (de eerste keer is internet nodig).
2. Tik op **Deel** en kies **Zet op beginscherm**.
3. Start daarna **Splitskasteel** vanaf het beginscherm. Na de eerste succesvolle laadbeurt zijn de appbestanden offline beschikbaar, zolang Safari/iPadOS de lokale cache bewaart.

GitHub Pages is een gratis statische host. Voor deze webapp is geen Apple-ontwikkelaarslicentie nodig.

### Liggend spelen en bijwerken

Op brede schermen in liggende stand (vanaf 900 CSS-pixels) staan de opgave en de antwoordknoppen naast elkaar. Zo blijft de knop **Controleer** op een iPad 8e generatie bereikbaar zonder omlaag te scrollen, met grote cijfertoetsen. In staande stand blijft de indeling onder elkaar.

Na publicatie van een update: open de app met internet aan, wacht even en sluit en heropen de app. De nieuwe offlinecache wordt dan gebruikt. Wis geen websitegegevens en verwijder de app niet: de bestaande lokale voortgang moet behouden blijven.

## Spelen en voortgang

Kies een kamer op het kasteelplein. In de Rekentoren en Prinsessenmissie gebruikt Emma het grote toetsenbord; de Toverkamer geeft meerkeuzevragen; in de Magische Tuin verdeelt ze voorwerpen. Hints, niveaukeuze, geluid en ouderinstellingen zijn beschikbaar. XP en kleding worden lokaal bewaard. De ouderhoek kan voortgang exporteren naar JSON en later weer importeren. Bewaar het JSON-bestand op een vertrouwde plek; het bevat geen achternaam, geboortedatum of andere profielgegevens.

### Schatkamer: twee minuten rekenmagie

- Een ronde duurt altijd **120 seconden**, ook wanneer eerder 30 of 60 seconden was ingesteld. Pauze bevriest de resterende tijd; na hervatten loopt de klok verder. Zonder pauze loopt de tijd ook door als de app op de achtergrond staat.
- Elk bevestigd antwoord, goed of fout, wordt eenmaal geregistreerd. De volgende som verschijnt direct, zonder knop 'Volgende som'. Lege invoer wordt niet bevestigd. Na afloop telt een niet-beantwoorde som niet mee.
- Na afloop toont het **schattenboek** het aantal goede en foute antwoorden, de verdiende XP en alle ingevulde antwoorden. Bij fouten staat de juiste splitsing erbij. Fouten kosten geen XP; de bestaande XP-regels (10 zonder hint, 6 met hint, geen extra XP voor eerder beloonden opgaven) blijven gelden.
- Het **koninklijke record** is het hoogste aantal goede antwoorden in een voltooide ronde, met lokale datum en tijd. Ook herhaalde sommen tellen als goed voor deze rondescore, onafhankelijk van XP. Bij een gelijke score blijft de oorspronkelijke recorddatum staan. Het record is niet per niveau gescheiden.
- Het record en het laatste volledige schattenboek blijven lokaal bewaard, zijn vanaf het kasteel en de ouderhoek te bekijken en gaan mee in JSON-export/import. Oudere voortgangsbestanden blijven bruikbaar; die hebben nog geen record.
- Een ronde verlaten of de app herladen breekt die ronde af: er komt geen nieuw record of schattenboek, maar al verdiende XP en geregistreerde pogingen blijven bewaard. Een nieuwe ronde begint weer op 2 minuten. 'Begin opnieuw' in de ouderhoek wist ook het record en het schattenboek.

## Uitbreiden

- Rekensommen en beloningen: `src/game.ts`.
- Spelschermen en navigatie: `src/App.tsx`.
- Prinsessenillustratie: `src/Princess.tsx`.
- Gedeelde kleding- en sieradenillustraties: `src/OutfitArt.tsx`. De kleedkamer, beloningsmelding en prinses gebruiken dezelfde SVG-lagen. Verlopen, lichtaccenten, plooien en facetten geven een popachtige 3D-uitstraling zonder externe afbeeldingen of zware 3D-engine. Bestaande kleding-ID's, XP-drempels en opgeslagen outfits blijven gelijk.
- Kleuren, lay-out en animaties: `src/styles.css`.
- Offlinecache: `public/sw.js`.

De PWA-cache bevat de appbestanden van de build. De optionele lettertypen komen van Google Fonts als er internet is; bij offline gebruik vallen ze terug op systeemlettertypen.

### Browserklok bij testen

De timer gebruikt de browserklok. Pauzeer een gesimuleerde klok uitsluitend in een aparte testcontext. Als de Playwright-klok in de gedeelde voorbeeldbrowser wordt gebruikt, herstel dan altijd de actuele systeemtijd en hervat de klok voordat iemand weer gaat spelen. Controleer daarna met echte wachttijd dat de timer aftelt; een achtergebleven gepauzeerde testklok bevriest ook de voorbeeldapp.

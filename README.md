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

Vitest controleert de rekengenerator, antwoordopties, niveaus, XP-beloningen en herstel van ongeldige voortgangsbestanden. De build staat in `dist`.

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

## Spelen en voortgang

Kies een kamer op het kasteelplein. In de Rekentoren en Prinsessenmissie gebruikt Emma het grote toetsenbord; de Toverkamer geeft meerkeuzevragen; in de Magische Tuin verdeelt ze voorwerpen; de Schatkamer is optioneel en heeft pauze en drie tijdsduren. Hints, niveaukeuze, geluid en ouderinstellingen zijn beschikbaar. XP en kleding worden lokaal bewaard. De ouderhoek kan voortgang exporteren naar JSON en later weer importeren. Bewaar het JSON-bestand op een vertrouwde plek; het bevat geen achternaam, geboortedatum of andere profielgegevens.

## Uitbreiden

- Rekensommen en beloningen: `src/game.ts`.
- Spelschermen en navigatie: `src/App.tsx`.
- Prinsessenillustratie: `src/Princess.tsx`.
- Kleuren, lay-out en animaties: `src/styles.css`.
- Offlinecache: `public/sw.js`.

De PWA-cache bevat de appbestanden van de build. De optionele lettertypen komen van Google Fonts als er internet is; bij offline gebruik vallen ze terug op systeemlettertypen.

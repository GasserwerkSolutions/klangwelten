# CLAUDE.md — Oberton Klangwelten

Projekt-Kontext für AI-Sessions. Kurz, dafür Pflicht-Lektüre.

Stand: 2026-06-02.

---

## Was diese Site ist

Statische HTML-Site für **Oberton Klangwelten** — Klangreisen, Trommelkreise und
Wissen rund um Obertöne (Raum: Brügg bei Biel, Kanton Bern).

Deployment: **Cloudflare Pages** (statisches Direct-Upload, kein Build-Step, kein
React/TS). Edits gehen direkt auf live HTML/CSS/JS.

- Geplante Produktions-URL: `https://oberton-klangwelten.ch/`
- Cookie-frei, kein Tracking, keine externen Einbindungen (Maps/Analytics/Fonts).
- Kontaktaufnahme läuft per `mailto:info@oberton-klangwelten.ch` — **es gibt kein
  Formular-Backend mehr** (die alten Pages Functions `/api/contact` und
  `/api/reviews` wurden am 2026-06-02 entfernt).

### Seiten (7 indexierbare/sichtbare)

- `index.html` — Startseite (eigenständig, **CSS inline** im `<head>`, lädt *nicht*
  `klang.css`)
- `angebote/klangreise/index.html`
- `angebote/trommelkreis/index.html`
- `obertoene/index.html`
- `404.html`
- `impressum.html` + `datenschutz.html` (beide `noindex`)

Alle Seiten ausser `index.html` laden das gemeinsame Stylesheet `assets/klang.css`.

### Alte URLs / Redirects

Die frühere Zahnarzt-Site (Zahnärztehaus Arch) lebte unter `/behandlungen/*` und
`/praxis/`. Diese Pfade werden via `_redirects` per **301** thematisch auf die neuen
Seiten umgeleitet. Die statischen Stub-Dateien wurden entfernt, damit `_redirects`
greift (Cloudflare Pages bevorzugt statische Files vor `_redirects`).

---

## Pflicht-Step nach JEDER HTML-Bearbeitung

```
node _workshop/scripts/validate-html.js
```

Muss `✓ Alle N Seiten OK.` zurückgeben, bevor die Session als „erledigt" gilt.

**Warum:** Früher war eine Produktions-HTML mid-statement abgeschnitten — der inline
`<script>`-Block lief nicht mehr, ohne dass Lighthouse oder visuelles Review das
aufgriff. Das Script prüft pro Seite: endet mit `</html>`, Tag-Balance
(`html`/`head`/`body`/`main`), parst jeden inline-`<script>` mit `vm.Script` und jeden
`application/ld+json`-Block mit `JSON.parse`. Exit 0 = OK, 1 = Fehler.

Bei **Direct Upload** (aktueller Modus) greift kein Build-Hook — vor jedem Upload
manuell ausführen.

---

## Design-System

Verbindlich ist der Code in `assets/klang.css` (Subseiten) bzw. dem inline-`<style>`
in `index.html`. Beide teilen dieselben Tokens und Komponenten-Klassen.

### Farben (Tokens in `:root`)

- `--paper #f7efe3` (Hintergrund), `--surface #fffaf2`, `--cream #fbf1df`
- `--ink #2f241b` (Text), `--muted #6b5d4f`
- `--forest #8a5b32` / `--forest-dark #3a291c` (Brand-Braun, CTA), `--gold #c89135`,
  `--clay #8a5b32` (Akzent/Eyebrow)
- Warmes Holz-/Lehm-Schema durchgängig; Hero/Subhero/Sound-Band/CTA mit dunklen
  Holz-Overlays über Foto-Hintergründen.

### Typo

- Display = Serif (`--font-display`: Iowan Old Style / Palatino / Georgia)
- Body = System-Stack (`--font-body`: system-ui …). **Keine Webfonts** — es werden
  bewusst System-/Serif-Stacks genutzt (die früheren woff2-Dateien wurden entfernt).
- `h1` Startseite: `5.6rem` (clamp via Media-Queries auf 4.1rem/2.75rem).

### Komponenten (Klassen in klang.css)

`site-header`/`nav`/`brand` (CSS-generierte `.brand__mark`, kein Logo-Bild),
`hero`/`subhero` (`--klangreise`/`--trommelkreis`/`--obertoene`), `section`
(`--soft`), `card`/`card--link`/`card__image`, `sound-band`, `grid` (`--2`/`--3`),
`page-grid` + `aside`, `flow`/`step`, `overtone-note`, `cta`, `site-footer`, `btn`
(`--primary`/`--ghost`), `eyebrow`.

Breakpoints: **920px** (Layout-Stack, Nav scrollt horizontal) und **560px**
(Phone-Shrink). Neue Media-Queries dieselben Werte nutzen.

---

## Assets

- `assets/klang.css` — einziges externes Stylesheet (Subseiten).
- `assets/favicon.svg`, `assets/apple-touch-icon.png` (+ `.svg`-Quelle) — Holz-
  Gradient mit Schallwellen-Motiv.
- `assets/photos/*-wood.{webp,jpg}` — Hero, Klangreise, Trommelkreis, Obertöne, OG.
  Eingebunden via `<picture>` mit WebP + JPG-Fallback. **Nur die `-wood`-Varianten
  existieren** (die früheren Versionen ohne Suffix wurden entfernt).

Cache-Buster: `_headers` setzt `max-age=300, must-revalidate` für `*.css` und
`*.html`, daher ist kein `?v=N`-Counter nötig (anders als in der alten Site).

---

## Manuelle Sync-Pflichten

- **Header/Footer-Markup** ist in den 4 Subseiten + Impressum/Datenschutz dupliziert
  (kein Template-Engine). Header-Änderungen über alle Seiten mit identischem
  `old_string` editieren.
- **`sitemap.xml`** listet die 4 indexierbaren Seiten. Bei neuer Seite Eintrag
  ergänzen.
- **JSON-LD** (`LocalBusiness`) liegt im `<head>` von `index.html`. Bei Änderung von
  Name/Adresse/Angeboten dort mitziehen.

---

## Was AI NICHT machen soll

- **Keine erfundenen Trust-Signale / Heilversprechen.** Klangarbeit ist Wohlbefinden,
  keine Heilbehandlung — keine medizinischen Wirkversprechen, keine Garantien.
- **Keine erfundenen Impressums-/Kontaktdaten.** Platzhalter `[ ]` in `impressum.html`
  nur durch echte, vom Betreiber gelieferte Angaben ersetzen.
- **Nichts in production HTML truncaten.** Immer mit präzisem `old_string`/`new_string`
  arbeiten und danach `validate-html.js` laufen lassen.
- **Keine Tracking-Cookies / Analytics / externe Fonts ohne explizite Zustimmung.**
  Site ist cookie- und drittanbieterfrei und soll es bleiben (siehe CSP in `_headers`).

---

## Workshop-Verzeichnis

`_workshop/scripts/` enthält das HTML-Validierungs-Script. Der Ordner wird vom
Validator selbst übersprungen und ist über `robots.txt` vom Crawling
ausgeschlossen.

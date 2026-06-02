# Oberton Klangwelten — Website

Statische Site für Klangreisen, Trommelkreise und Obertöne (Brügg bei Biel, BE).
Deployment via **Cloudflare Pages** (Direct Upload, kein Build-Step).

Detaillierter Projekt-Kontext und Konventionen: siehe [CLAUDE.md](CLAUDE.md).

---

## Struktur

```
.
├── index.html                     Startseite (CSS inline, lädt nicht klang.css)
├── angebote/
│   ├── klangreise/index.html
│   └── trommelkreis/index.html
├── obertoene/index.html
├── impressum.html                 noindex · Platzhalter [ ] vor Go-Live füllen
├── datenschutz.html               noindex
├── 404.html
├── _headers                       Security-Header + CSP + Caching
├── _redirects                     301 von alten /behandlungen/* und /praxis/
├── robots.txt
├── sitemap.xml
├── manifest.json
├── assets/
│   ├── klang.css                  einziges externes Stylesheet (Subseiten)
│   ├── favicon.svg · apple-touch-icon.png/.svg
│   └── photos/*-wood.{webp,jpg}   Hero, Klangreise, Trommelkreis, Obertöne, OG
└── _workshop/scripts/
    └── validate-html.js           Pflicht-Check nach jeder HTML-Bearbeitung
```

## Pflicht-Check nach HTML-Edits

```
node _workshop/scripts/validate-html.js
```

Muss `✓ Alle N Seiten OK.` liefern, bevor hochgeladen wird.

## Vor dem Go-Live offen

- **Impressum**: Platzhalter `[ ]` (Name, Adresse, Rechtsform) mit echten Angaben
  füllen — in der Schweiz Pflicht.
- **Domain**: `oberton-klangwelten.ch` auf Cloudflare Pages aufschalten, SSL aktiv.
- **Validatoren**: schema.org Rich-Results-Test (LocalBusiness-LD in `index.html`),
  PageSpeed/Lighthouse.

## Deployment (Cloudflare Pages, Direct Upload)

```
wrangler pages deploy . --project-name=<projekt> --branch=main --commit-dirty=true
```

Cookie-frei, kein Tracking, keine externen Einbindungen — soll so bleiben.

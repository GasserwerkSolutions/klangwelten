#!/usr/bin/env node
/**
 * validate-html.js — Pflicht-Step nach JEDER HTML-Bearbeitung.
 *
 * Hintergrund: Am 2026-05-10 war eine Produktions-HTML mid-statement
 * abgeschnitten; der gesamte inline-<script>-Block lief nicht mehr, ohne dass
 * Lighthouse oder visuelles Review das aufgriffen. Dieses Script fängt genau
 * solche Fehler vor dem Deploy ab.
 *
 * Was geprüft wird, pro produktiver HTML-Seite:
 *   1. Datei endet (nach trim) mit </html>.
 *   2. Tag-Balance: <html>/<head>/<body>/<main> öffnen == schliessen.
 *   3. Jeder inline-<script>-Block (kein src=…, kein application/ld+json) wird
 *      mit Node's vm.Script geparst. Fängt unterminated strings, mid-statement
 *      EOF, fehlende Brackets, alle JS-SyntaxErrors.
 *   4. application/ld+json-Blöcke werden mit JSON.parse validiert.
 *
 * Exit-Code 0 = OK, 1 = Fehler.
 *
 * Aufruf aus dem Projekt-Root:  node _workshop/scripts/validate-html.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');

// Verzeichnisse, die nicht gescannt werden.
const SKIP_DIRS = new Set(['node_modules', '_workshop', '.git', 'assets']);

// Reine Redirect-/Meta-Refresh-Stubs brauchen keine Tag-Balance-Prüfung;
// aktuell existieren keine mehr, aber als Sicherheitsnetz erkennen wir sie.
function isRedirectStub(html) {
  return /http-equiv=["']?refresh/i.test(html) && !/<main/i.test(html);
}

function findHtmlFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      findHtmlFiles(path.join(dir, entry.name), acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

function countTag(html, tag) {
  const open = (html.match(new RegExp(`<${tag}(\\s|>)`, 'gi')) || []).length;
  const close = (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
  return { open, close };
}

// Extrahiert inline-<script>-Inhalte mit ihrem type-Attribut.
function extractScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/.test(attrs)) continue; // externes Script, kein Inline-Code
    const typeMatch = attrs.match(/type\s*=\s*["']([^"']+)["']/i);
    out.push({ type: typeMatch ? typeMatch[1].toLowerCase() : 'text/javascript', code: m[2] });
  }
  return out;
}

const files = findHtmlFiles(ROOT).sort();
const errors = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  if (isRedirectStub(html)) continue; // Stub: nur HTML-Skelett, keine tiefe Prüfung

  // 1. Endet mit </html>
  if (!/<\/html>\s*$/i.test(html.trimEnd() + '\n')) {
    errors.push(`${rel}: Datei endet nicht mit </html> (mögliche Truncation).`);
  }

  // 2. Tag-Balance
  for (const tag of ['html', 'head', 'body', 'main']) {
    const { open, close } = countTag(html, tag);
    if (open !== close) {
      errors.push(`${rel}: <${tag}> unbalanciert (${open} offen, ${close} geschlossen).`);
    }
  }

  // 3./4. Script-Blöcke parsen
  for (const { type, code } of extractScripts(html)) {
    if (type === 'application/ld+json') {
      try {
        JSON.parse(code);
      } catch (e) {
        errors.push(`${rel}: ungültiges JSON-LD — ${e.message}`);
      }
      continue;
    }
    if (type === 'text/javascript' || type === 'module' || type === 'application/javascript') {
      try {
        new vm.Script(code, { filename: rel });
      } catch (e) {
        errors.push(`${rel}: JS-SyntaxError im inline-<script> — ${e.message}`);
      }
    }
  }
}

if (errors.length) {
  console.error('✗ HTML-Validierung fehlgeschlagen:\n');
  for (const e of errors) console.error('  • ' + e);
  console.error(`\n${errors.length} Problem(e) in ${files.length} geprüften Seiten.`);
  process.exit(1);
}

console.log(`✓ Alle ${files.length} Seiten OK.`);
process.exit(0);

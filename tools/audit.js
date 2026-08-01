/* Repo hygiene audit. Reports, changes nothing.

   Finds: CSS classes defined but never used, classes used but never defined,
   CSS custom properties declared but never referenced, images on disk that
   nothing links to, and ids referenced but missing.

   Run: node tools/audit.js */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const CSS_DIR = path.join(ROOT, "assets", "css");
const CSS = fs.readdirSync(CSS_DIR).filter((f) => f.endsWith(".css"));
const IMG_DIR = path.join(ROOT, "assets", "img");

const read = (p) => fs.readFileSync(p, "utf8");
const htmlText = HTML.map((f) => read(path.join(ROOT, f))).join("\n");
const jsText = read(path.join(ROOT, "assets", "js", "main.js"));

/* Inline <style> blocks count as CSS. 404.html styles its whole layout that
   way, and ignoring it reported every .lost rule as an undefined class. */
const inlineStyles = [...htmlText.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
  .map((m) => m[1])
  .join("\n");

/* Comments and url() payloads are stripped first. Without that, hostnames in
   doc links (w3.org, primer.style) parse as class selectors. */
const cssText = (CSS.map((f) => read(path.join(CSS_DIR, f))).join("\n") + "\n" + inlineStyles)
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/url\([^)]*\)/g, "url()");

function section(title) {
  console.log(`\n${title}\n${"-".repeat(title.length)}`);
}

/* ---- classes -------------------------------------------------------------- */
const cssClasses = new Set();
for (const m of cssText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
  // skip things that are clearly not selectors, e.g. decimals in 0.5rem
  cssClasses.add(m[1]);
}

const htmlClasses = new Set();
for (const m of htmlText.matchAll(/class="([^"]+)"/g)) {
  m[1].split(/\s+/).forEach((c) => c && htmlClasses.add(c));
}
/* classes the JS adds or looks for at runtime */
for (const m of jsText.matchAll(/["'`](?:\.)?((?:is-|no-|img-)[\w-]+)["'`]/g)) htmlClasses.add(m[1]);
for (const m of jsText.matchAll(/classList\.(?:add|remove|toggle)\("([^"]+)"\)/g)) htmlClasses.add(m[1]);
for (const m of jsText.matchAll(/className = "([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => htmlClasses.add(c));

const orphanCss = [...cssClasses]
  .filter((c) => !htmlClasses.has(c))
  .filter((c) => !/^(ph|hover|focus|active|is-|no-)/.test(c))
  .sort();

/* A block name with no rule of its own is fine when its BEM children are
   styled: .trophy has no declarations but .trophy__grid does, and naming the
   block is the convention rather than an oversight. */
const hasBemChildren = (c) => new RegExp(`\\.${c}__`).test(cssText);

const undefinedInCss = [...htmlClasses]
  .filter((c) => !cssClasses.has(c) && !/^ph(-|$)/.test(c) && !hasBemChildren(c))
  .sort();

section(`CSS classes never used in HTML or JS (${orphanCss.length})`);
orphanCss.forEach((c) => console.log(`  .${c}`));

section(`HTML classes with no CSS rule (${undefinedInCss.length})`);
undefinedInCss.forEach((c) => console.log(`  .${c}`));

/* ---- custom properties ---------------------------------------------------- */
const declared = new Set();
for (const m of cssText.matchAll(/^\s*(--[\w-]+)\s*:/gm)) declared.add(m[1]);
const referenced = new Set();
for (const m of cssText.matchAll(/var\((--[\w-]+)/g)) referenced.add(m[1]);
for (const m of htmlText.matchAll(/(--[\w-]+)\s*:/g)) referenced.add(m[1]);
for (const m of jsText.matchAll(/["'](--[\w-]+)["']/g)) referenced.add(m[1]);

const unusedVars = [...declared].filter((v) => !referenced.has(v)).sort();
section(`Custom properties declared but never referenced (${unusedVars.length})`);
unusedVars.forEach((v) => console.log(`  ${v}`));

/* ---- images --------------------------------------------------------------- */
const onDisk = fs.existsSync(IMG_DIR)
  ? fs.readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png|gif|webp|svg)$/i.test(f))
  : [];
const unusedImages = onDisk.filter((f) => !htmlText.includes(`assets/img/${f}`));
section(`Images on disk that nothing references (${unusedImages.length})`);
unusedImages.forEach((f) => {
  const kb = Math.round(fs.statSync(path.join(IMG_DIR, f)).size / 1024);
  console.log(`  ${f}  (${kb}kb)`);
});

/* ---- ids ------------------------------------------------------------------ */
section("Fragment links with no matching id");
let deadIds = 0;
for (const file of HTML) {
  const doc = read(path.join(ROOT, file));
  const ids = new Set([...doc.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
  for (const m of doc.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(m[1])) {
      console.log(`  ${file} -> #${m[1]}`);
      deadIds++;
    }
  }
}
if (!deadIds) console.log("  none");

/* ---- totals --------------------------------------------------------------- */
section("Totals");
const cssBytes = CSS.reduce((n, f) => n + fs.statSync(path.join(CSS_DIR, f)).size, 0);
const imgBytes = onDisk.reduce((n, f) => n + fs.statSync(path.join(IMG_DIR, f)).size, 0);
console.log(`  html      ${HTML.length} files`);
console.log(`  css       ${CSS.length} files, ${Math.round(cssBytes / 1024)}kb`);
console.log(`  images    ${onDisk.length} files, ${Math.round(imgBytes / 1024)}kb`);
console.log(`  sections  ${(read(path.join(ROOT, "index.html")).match(/<section/g) || []).length} on index.html`);

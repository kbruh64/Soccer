/* One tool for every image job. Replaces the four overlapping scripts that
   used to live here (resize-images, localise-images, check-images, credits),
   which had drifted into doing parts of each other's work.

   Usage:
     node tools/images.js              verify local integrity (default)
     node tools/images.js --fetch      pull any remote image local, repoint HTML
     node tools/images.js --optimise   refetch oversized files at their slot width
     node tools/images.js --credits    regenerate CREDITS.md from sources.json
     node tools/images.js --all        fetch, optimise, credits, verify

   RULE, learned the hard way twice: never hand build a Wikimedia thumbnail
   URL. The thumbnailer refuses to upscale, so requesting a width larger than
   the original returns HTTP 400 and the image silently breaks. Always resolve
   through the API, which clamps the request and returns a URL that exists. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IMG_DIR = path.join(ROOT, "assets", "img");
const SOURCES = path.join(IMG_DIR, "sources.json");
const UA = "CharterRecords-images/1.0 (static site build; contact via repo)";
const API = "https://commons.wikimedia.org/w/api.php";
const HTML = ["index.html", "timeline.html", "halloffame.html"];
const GAP_MS = 700;

/* Full bleed plates cover the viewport and need real resolution. Everything
   else sits in a card, a plate or a thumbnail.

   500px, not 700px: Commons only renders thumbnails at certain widths and
   returns the untouched original for the rest. Empirically 320, 400 and 500
   produce real thumbnails while 600, 640, 700, 768 and 1024 hand back the
   original, which is why an earlier run at 700px saved nothing at all. 500 is
   also what the timeline page already uses, and that is the best sized page
   in the project at roughly 90kb per photograph. */
const FULL_BLEED = /vista-aerea|women-s-world-cup-2019-final-confetti/;
const WIDTH_FULL_BLEED = 1600;
const WIDTH_DEFAULT = 500;
/* Only refetch a file if it is heavier than this. Files already under it are
   correctly sized and refetching would risk making them larger. */
const OPTIMISE_OVER_KB = 200;

const args = process.argv.slice(2);
const want = (flag) => args.includes(flag) || args.includes("--all");
const DO_FETCH = want("--fetch");
const DO_OPT = want("--optimise");
const DO_CREDITS = want("--credits");
const DO_VERIFY = args.length === 0 || want("--verify") || args.includes("--all");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const read = (p) => fs.readFileSync(p, "utf8");
const kb = (bytes) => Math.round(bytes / 1024);

function dedupe(s) {
  const h = s.length / 2;
  return s.length % 2 === 0 && s.slice(0, h) === s.slice(h) ? s.slice(0, h) : s;
}
const stripHtml = (s) =>
  dedupe(String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());

function loadSources() {
  return JSON.parse(read(SOURCES)).files;
}
function saveSources(files) {
  const doc = JSON.parse(read(SOURCES));
  doc.files = files;
  fs.writeFileSync(SOURCES, JSON.stringify(doc, null, 2) + "\n", "utf8");
}

function slugify(name) {
  const ext = (name.match(/\.[a-z0-9]+$/i) || [".jpg"])[0].toLowerCase();
  const base = name
    .slice(0, name.length - ext.length)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 58);
  return `${base || "plate"}${ext}`;
}

/* Resolves Commons file names to a usable URL plus attribution, in batches. */
async function resolve(names, width) {
  const out = new Map();
  for (let i = 0; i < names.length; i += 25) {
    const batch = names.slice(i, i + 25);
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "imageinfo",
      iiprop: "url|size|extmetadata",
      iiurlwidth: String(width),
      titles: batch.map((n) => `File:${n}`).join("|"),
    });
    const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA } });
    const json = await res.json();

    const alias = new Map();
    for (const n of (json.query && json.query.normalized) || []) alias.set(n.to, n.from);

    for (const page of Object.values((json.query && json.query.pages) || {})) {
      const info = page.imageinfo && page.imageinfo[0];
      if (!info) continue;
      const asked = (alias.get(page.title) || page.title).replace(/^File:/, "");
      const ex = info.extmetadata || {};
      out.set(asked, {
        url: info.thumburl || info.url,
        artist: stripHtml(ex.Artist && ex.Artist.value) || "Unknown",
        licence: stripHtml(ex.LicenseShortName && ex.LicenseShortName.value) || "See file page",
        descUrl: info.descriptionurl,
      });
    }
    await sleep(GAP_MS);
  }
  return out;
}

async function download(url, dest) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 200) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      return buf.length;
    }
    await sleep(GAP_MS * attempt * 3); // 429 means slow down, not fail
  }
  return 0;
}

/* -------------------------------------------------------------------------- */
async function doFetch() {
  console.log("\nFETCH");
  const files = loadSources();
  const jobs = new Map();

  for (const f of HTML) {
    const doc = read(path.join(ROOT, f));
    const re = /src="(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/[^"]+)"/g;
    for (const m of doc.matchAll(re)) {
      const url = m[1];
      const thumb = url.match(/\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/([^\/]+)\//);
      const plain = url.match(/\/commons\/[0-9a-f]\/[0-9a-f]{2}\/([^"\/]+)$/);
      const name = decodeURIComponent((thumb || plain || [])[1] || "").replace(/ /g, "_");
      if (name) jobs.set(url, { name, slug: slugify(name) });
    }
  }

  if (!jobs.size) {
    console.log("  nothing remote, all images already local");
    return;
  }

  const meta = await resolve([...new Set([...jobs.values()].map((j) => j.name))], WIDTH_DEFAULT);
  for (const [url, job] of jobs) {
    const dest = path.join(IMG_DIR, job.slug);
    const info = meta.get(job.name) || meta.get(job.name.replace(/_/g, " ")) || {};
    if (!fs.existsSync(dest) || fs.statSync(dest).size < 1024) {
      const size = await download(info.url || url, dest);
      console.log(size ? `  saved   ${job.slug} (${kb(size)}kb)` : `  FAILED  ${job.slug}`);
      await sleep(GAP_MS);
    }
    if (fs.existsSync(dest)) files[job.slug] = job.name.replace(/_/g, " ");
  }
  saveSources(files);

  for (const f of HTML) {
    const full = path.join(ROOT, f);
    let doc = read(full);
    for (const [url, job] of jobs) {
      if (fs.existsSync(path.join(IMG_DIR, job.slug))) {
        doc = doc.split(`src="${url}"`).join(`src="assets/img/${job.slug}"`);
      }
    }
    fs.writeFileSync(full, doc, "utf8");
  }
}

/* -------------------------------------------------------------------------- */
async function doOptimise() {
  console.log("\nOPTIMISE");
  const files = loadSources();
  const heavy = Object.keys(files).filter((slug) => {
    const p = path.join(IMG_DIR, slug);
    if (!fs.existsSync(p)) return false;
    if (FULL_BLEED.test(slug)) return false; // these earn their bytes
    return fs.statSync(p).size > OPTIMISE_OVER_KB * 1024;
  });

  if (!heavy.length) {
    console.log(`  nothing over ${OPTIMISE_OVER_KB}kb outside the full bleed plates`);
    return;
  }

  console.log(`  ${heavy.length} file(s) over ${OPTIMISE_OVER_KB}kb, refetching at ${WIDTH_DEFAULT}px`);
  const meta = await resolve(heavy.map((s) => files[s]), WIDTH_DEFAULT);

  let before = 0;
  let after = 0;
  for (const slug of heavy) {
    const p = path.join(IMG_DIR, slug);
    const was = fs.statSync(p).size;
    const info = meta.get(files[slug]) || meta.get(files[slug].replace(/ /g, "_"));
    if (!info) {
      console.log(`  no result  ${slug}`);
      continue;
    }
    const tmp = `${p}.new`;
    const got = await download(info.url, tmp);
    if (fs.existsSync(tmp) && !got) fs.unlinkSync(tmp);

    if (!got) {
      /* Distinguish a failed download from a file that genuinely cannot be
         made smaller. Conflating the two hid a real problem once already. */
      console.log(`  DOWNLOAD FAILED  ${slug} (kept existing ${kb(was)}kb)`);
      before += was;
      after += was;
    } else if (got < was) {
      fs.renameSync(tmp, p);
      console.log(`  ${slug}  ${kb(was)}kb -> ${kb(got)}kb`);
      before += was;
      after += got;
    } else {
      fs.unlinkSync(tmp);
      console.log(`  already minimal  ${slug} (${kb(was)}kb)`);
      before += was;
      after += was;
    }
    await sleep(GAP_MS);
  }
  console.log(`  saved ${kb(before - after)}kb across ${heavy.length} file(s)`);
}

/* -------------------------------------------------------------------------- */
async function doCredits() {
  console.log("\nCREDITS");
  const files = loadSources();
  const meta = await resolve(Object.values(files), WIDTH_DEFAULT);

  const rows = Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, name]) => {
      const m = meta.get(name) || meta.get(name.replace(/ /g, "_")) || {};
      return {
        slug,
        artist: (m.artist || "See file page").replace(/\|/g, "/").slice(0, 90),
        licence: m.licence || "See file page",
        url:
          m.descUrl ||
          `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name.replace(/ /g, "_"))}`,
      };
    });

  const doc = [
    "# Photograph credits",
    "",
    `${rows.length} photographs, all served from \`assets/img/\` in this repository`,
    "and all originally from Wikimedia Commons under a free licence.",
    "",
    "They are hosted here rather than hotlinked, which is permitted for freely",
    "licensed work provided attribution travels with the files. That is what this",
    "page is. Provenance lives in `assets/img/sources.json`; author and licence",
    "below come from the Commons API via `tools/images.js --credits`, so the table",
    "cannot drift from what is on disk.",
    "",
    "To reuse any of these, take the file from its Commons page and follow that",
    "page's terms rather than copying it from here.",
    "",
    "| File | Author | Licence | Source |",
    "|---|---|---|---|",
    ...rows.map((r) => `| \`${r.slug}\` | ${r.artist} | ${r.licence} | [Commons](${r.url}) |`),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(ROOT, "CREDITS.md"), doc, "utf8");
  console.log(`  CREDITS.md written, ${rows.length} entries`);
}

/* -------------------------------------------------------------------------- */
function doVerify() {
  console.log("\nVERIFY");
  const files = loadSources();
  const onDisk = fs.readdirSync(IMG_DIR).filter((f) => /\.(jpe?g|png|gif|webp)$/i.test(f));
  const referenced = new Set();
  let problems = 0;

  for (const f of HTML.concat(["404.html", "privacy.html", "terms.html", "corrections.html"])) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const doc = read(p);
    for (const m of doc.matchAll(/src="assets\/img\/([^"]+)"/g)) referenced.add(m[1]);
    if (/src="https?:\/\//.test(doc)) {
      console.log(`  ${f} still references a remote image`);
      problems++;
    }
  }

  for (const slug of referenced) {
    const p = path.join(IMG_DIR, slug);
    if (!fs.existsSync(p) || fs.statSync(p).size < 1024) {
      console.log(`  missing or empty: ${slug}`);
      problems++;
    }
    if (!files[slug]) {
      console.log(`  no provenance in sources.json: ${slug}`);
      problems++;
    }
  }
  for (const f of onDisk) {
    if (!referenced.has(f)) {
      console.log(`  on disk but unreferenced: ${f} (${kb(fs.statSync(path.join(IMG_DIR, f)).size)}kb)`);
      problems++;
    }
  }

  const total = [...referenced].reduce(
    (n, s) => n + (fs.existsSync(path.join(IMG_DIR, s)) ? fs.statSync(path.join(IMG_DIR, s)).size : 0),
    0
  );
  console.log(`  ${referenced.size} referenced, ${onDisk.length} on disk, ${kb(total)}kb total`);
  console.log(problems ? `  ${problems} problem(s)` : "  no problems");

  for (const f of HTML) {
    const doc = read(path.join(ROOT, f));
    const used = new Set([...doc.matchAll(/src="assets\/img\/([^"]+)"/g)].map((m) => m[1]));
    const bytes = [...used].reduce(
      (n, s) => n + (fs.existsSync(path.join(IMG_DIR, s)) ? fs.statSync(path.join(IMG_DIR, s)).size : 0),
      0
    );
    console.log(`    ${f.padEnd(18)} ${String(used.size).padStart(2)} images  ${String(kb(bytes)).padStart(5)}kb`);
  }
}

(async () => {
  if (DO_FETCH) await doFetch();
  if (DO_OPT) await doOptimise();
  if (DO_CREDITS) await doCredits();
  if (DO_VERIFY) doVerify();
  console.log("");
})();

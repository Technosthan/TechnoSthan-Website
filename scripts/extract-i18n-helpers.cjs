const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "frontend", "src");

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (full.includes("node_modules")) continue;
      walk(full, files);
    } else if (e.isFile() && /\.(js|jsx|ts|tsx)$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

function extractStrings(content) {
  const regex = />\s*([A-Za-z0-9\-\'\"\.,\s\(\)\/:\?&]+?)\s*</g;
  const matches = new Set();
  let m;
  while ((m = regex.exec(content))) {
    const txt = m[1].trim();
    if (!txt) continue;
    if (txt.length < 2) continue;
    if (/\{|\}/.test(txt)) continue;
    matches.add(txt);
  }
  return Array.from(matches);
}

function makeKey(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

function main() {
  const files = walk(SRC);
  const map = {};
  for (const f of files) {
    const c = fs.readFileSync(f, "utf8");
    const strings = extractStrings(c);
    for (const s of strings) {
      const k = makeKey(s);
      if (!map[k]) map[k] = s;
    }
  }

  const out = path.resolve("i18n_extracted_candidates.json");
  fs.writeFileSync(out, JSON.stringify(map, null, 2), "utf8");
  console.log("Wrote", out, "with", Object.keys(map).length, "candidates");
}

if (require.main === module) main();

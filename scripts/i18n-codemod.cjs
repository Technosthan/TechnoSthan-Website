const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "frontend", "src");
const CANDIDATES = path.join(
  __dirname,
  "..",
  "frontend",
  "i18n_extracted_candidates.json",
);
const OUT = path.join(__dirname, "..", "frontend", "i18n_codemod_dryrun.json");

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (full.includes("node_modules")) continue;
      walk(full, files);
    } else if (e.isFile() && /\.(js|jsx|ts|tsx)$/.test(e.name))
      files.push(full);
  }
  return files;
}

function isAlreadyTranslated(content, idx) {
  // naive: check 20 chars before for t( or i18n.t
  const start = Math.max(0, idx - 40);
  const snippet = content.slice(start, idx);
  return /t\(|i18n\.t\(|useTranslation\(|\$t\(/.test(snippet);
}

function runDryRun() {
  if (!fs.existsSync(CANDIDATES)) {
    console.error("Candidates file missing:", CANDIDATES);
    process.exit(1);
  }

  const candidates = JSON.parse(fs.readFileSync(CANDIDATES, "utf8"));
  const files = walk(SRC);

  const results = {};
  let totalMatches = 0;

  const keys = Object.keys(candidates).sort((a, b) => b.length - a.length);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const fileMatches = [];
    for (const key of keys) {
      const original = candidates[key];
      let idx = content.indexOf(original);
      while (idx !== -1) {
        if (!isAlreadyTranslated(content, idx)) {
          fileMatches.push({ key, original, index: idx });
          totalMatches++;
        }
        idx = content.indexOf(original, idx + original.length);
      }
    }
    if (fileMatches.length) results[file.replace(/\\/g, "/")] = fileMatches;
  }

  const summary = {
    totalFiles: Object.keys(results).length,
    totalMatches,
    resultsCountPerFile: {},
  };
  for (const f of Object.keys(results))
    summary.resultsCountPerFile[f] = results[f].length;

  fs.writeFileSync(OUT, JSON.stringify({ summary, results }, null, 2), "utf8");
  console.log("Dry-run written to", OUT);
  console.log(
    "Files with matches:",
    summary.totalFiles,
    "Total matches:",
    summary.totalMatches,
  );
}

if (require.main === module) runDryRun();

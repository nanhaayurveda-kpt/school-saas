// cleanup.js
// इसे E:\sps में रखकर चलाएं: node cleanup.js
// पहले git commit कर लें ताकि वापस पलटना हो तो git checkout से हो सके।
// यह app/, lib/, components/ के सभी .js files को in-place edit करता है।

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const TARGET_DIRS = ["app", "lib", "components"];

function findMatchingParen(s, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function findEnclosingOpen(content, pos) {
  let depth = 0;
  for (let i = pos - 1; i >= 0; i--) {
    const c = content[i];
    if (c === ")") depth++;
    else if (c === "(") {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

function splitTopLevel(s) {
  const args = [];
  let depth = 0,
    cur = "",
    inStr = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      cur += c;
      if (c === "\\" && i + 1 < s.length) {
        cur += s[i + 1];
        i++;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      cur += c;
      continue;
    }
    if ("([{".includes(c)) {
      depth++;
      cur += c;
      continue;
    }
    if (")]}".includes(c)) {
      depth--;
      cur += c;
      continue;
    }
    if (c === "," && depth === 0) {
      args.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur) args.push(cur);
  return args;
}

const norm = (s) => s.replace(/\s+/g, "");

function wordBefore(content, idx) {
  let j = idx - 1;
  while (j >= 0 && /[A-Za-z0-9_]/.test(content[j])) j--;
  return [content.slice(j + 1, idx), j + 1];
}

const USER_ID_EQ_RE = /eq\(\s*[\w.]+\.user_id\s*,/g;

function processOnce(content, report, filename) {
  USER_ID_EQ_RE.lastIndex = 0;
  let m;
  while ((m = USER_ID_EQ_RE.exec(content)) !== null) {
    const eqStart = m.index;
    const openIdx = content.indexOf("(", eqStart);
    const closeIdx = findMatchingParen(content, openIdx);
    if (closeIdx === -1) continue;
    const eqFull = content.slice(eqStart, closeIdx + 1);

    const encOpen = findEnclosingOpen(content, eqStart);
    if (encOpen === -1) continue;
    const [word, wordStart] = wordBefore(content, encOpen);
    const encClose = findMatchingParen(content, encOpen);
    if (encClose === -1 || encClose < closeIdx) continue;

    if (word === "and") {
      const inner = content.slice(encOpen + 1, encClose);
      const args = splitTopLevel(inner);
      const newArgs = args.filter((a) => norm(a) !== norm(eqFull));
      if (newArgs.length === args.length) continue;
      let replacement;
      if (newArgs.length === 0) {
        report.push(`${filename}: and() empty near ${eqFull.slice(0, 50)} -> REVIEW`);
        replacement = "sql`1=1`";
      } else if (newArgs.length === 1) {
        replacement = newArgs[0].trim();
      } else {
        replacement = "and(" + newArgs.map((a) => a.trim()).join(", ") + ")";
      }
      return [content.slice(0, wordStart) + replacement + content.slice(encClose + 1), true];
    } else if (word === "where") {
      const dotOk = wordStart > 0 && content[wordStart - 1] === ".";
      if (!dotOk) continue;
      const inner = content.slice(encOpen + 1, encClose);
      if (norm(inner) === norm(eqFull)) {
        return [content.slice(0, wordStart - 1) + content.slice(encClose + 1), true];
      }
      continue;
    }
  }
  return [content, false];
}

function cleanUserIdCalls(content, filename, report) {
  let changed = true,
    guard = 0;
  while (changed && guard < 1000) {
    [content, changed] = processOnce(content, report, filename);
    guard++;
  }
  return content;
}

function removeUserIdObjectLines(content, filename, report) {
  const re = /^[ \t]*user_id\s*:\s*[^\n,]+,?[ \t]*\r?\n/gm;
  let n = 0;
  const newContent = content.replace(re, () => {
    n++;
    return "";
  });
  if (n) report.push(`${filename}: removed ${n} 'user_id: ...,' object line(s)`);
  return newContent;
}

function removeArrayConditionLines(content, filename, report) {
  const re = /^[ \t]*eq\([\w.]+\.user_id\s*,\s*(?:MASTER_USER_ID|1)\)\s*,?[ \t]*\r?\n/gm;
  let n = 0;
  const newContent = content.replace(re, () => {
    n++;
    return "";
  });
  if (n) report.push(`${filename}: removed ${n} array-condition line(s)`);
  return newContent;
}

function cleanMasterUserIdImport(content, filename, report) {
  if (!content.includes("MASTER_USER_ID")) return content;
  const lines = content.split("\n");
  const usedElsewhere = lines.some((l) => l.includes("MASTER_USER_ID") && !l.includes("import"));
  if (usedElsewhere) return content;
  const newContent = content.replace(
    /import\s*\{\s*([^}]*MASTER_USER_ID[^}]*)\s*\}\s*from\s*["']@\/lib\/config["'];?\r?\n?/g,
    (full, namesStr) => {
      const names = namesStr
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n && n !== "MASTER_USER_ID");
      if (names.length === 0) return "";
      return `import { ${names.join(", ")} } from "@/lib/config";\n`;
    }
  );
  if (newContent !== content) report.push(`${filename}: cleaned unused MASTER_USER_ID import`);
  return newContent;
}

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (entry.name.endsWith(".js")) cb(full);
  }
}

function main() {
  const report = [];
  const remaining = [];

  for (const d of TARGET_DIRS) {
    const base = path.join(ROOT, d);
    if (!fs.existsSync(base)) continue;
    walk(base, (filePath) => {
      const rel = path.relative(ROOT, filePath);
      let content = fs.readFileSync(filePath, "utf8");
      const orig = content;

      content = cleanUserIdCalls(content, rel, report);
      content = removeUserIdObjectLines(content, rel, report);
      content = removeArrayConditionLines(content, rel, report);
      content = cleanMasterUserIdImport(content, rel, report);

      if (content !== orig) fs.writeFileSync(filePath, content, "utf8");

      const leftovers = content.match(/^.*\.user_id.*$/gm);
      if (leftovers) remaining.push([rel, leftovers]);
    });
  }

  let out = "=== AUTO-FIX ACTIONS ===\n";
  out += report.join("\n") + `\n\nTotal auto-fix actions: ${report.length}\n`;
  out += "\n=== REMAINING .user_id REFERENCES (मैनुअली चेक करें) ===\n";
  out += `Files with leftovers: ${remaining.length}\n`;
  for (const [rel, items] of remaining) {
    out += `\n${rel}:\n`;
    for (const it of items) out += `  ${it.trim()}\n`;
  }
  fs.writeFileSync(path.join(ROOT, "cleanup_report.txt"), out, "utf8");

  console.log(`Done. ${report.length} auto-fix actions. ${remaining.length} file(s) still need manual review.`);
  console.log(`Full report -> cleanup_report.txt`);
}

main();
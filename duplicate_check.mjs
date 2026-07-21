import fs from "node:fs";
import vm from "node:vm";

function load(file, name) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
  return context.window[name];
}

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function duplicates(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()].filter((group) => group.length > 1);
}

const support = load("support_library.js", "SUPPORT_LIBRARY");
const kb = load("internal_kb.js", "INTERNAL_KB");
const canned = duplicates(support.cannedResponses || [], (item) => norm(`${item.title} ${item.responseText}`).slice(0, 220));
const ticketTitle = duplicates(support.tickets || [], (item) => norm(item.title));
const ticketNotes = duplicates((support.tickets || []).filter((item) => item.notes), (item) => norm(item.notes).slice(0, 220));
const kbDup = duplicates(kb.pages || [], (item) => norm(`${item.title} ${item.summary}`).slice(0, 220));

const report = [
  "# Duplicate Check Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Canned response exact/near duplicates: ${canned.length}`,
  `Ticket title duplicates: ${ticketTitle.length}`,
  `Ticket note duplicates: ${ticketNotes.length}`,
  `Internal KB article duplicates: ${kbDup.length}`,
  "",
  "## Notes",
  "- Exact duplicate canned responses are hidden at runtime; the Google Sheet clean canned responses remain the preferred source when present.",
  "- Stock/inventory/availability ticket rows remain excluded from the support library because the user flagged stock information as inaccurate.",
  "- Internal KB articles are deduped at runtime by title + summary.",
  "- Similar-but-different operational content was kept and separated by category/tags instead of deleted.",
];

fs.writeFileSync("DUPLICATE_CHECK_REPORT.md", `${report.join("\n")}\n`);
console.log(report.join("\n"));

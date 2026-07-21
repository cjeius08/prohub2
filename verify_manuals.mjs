import fs from "node:fs";

const text = fs.readFileSync("medify_manuals.js", "utf8");
const json = text.replace(/^window\.MEDIFY_MANUALS = /, "").replace(/;\s*$/, "");
const data = JSON.parse(json);

const checks = {
  manuals: data.manuals.length,
  withImages: data.manuals.filter((item) => item.image).length,
  pdfManuals: data.manuals.filter((item) => /\.pdf/i.test(item.manualUrl)).length,
  warrantyPoints: data.warrantySummary.length,
};

console.log(JSON.stringify(checks, null, 2));
if (checks.manuals < 10 || checks.withImages < 8 || checks.pdfManuals < 10 || checks.warrantyPoints < 4) {
  process.exit(1);
}

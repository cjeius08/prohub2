import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const index = read("index.html");
const app = read("app.js");
const loader = read("support_processes.js");
const processCss = read("support_processes.css");
const contrastCss = read("dashboard_contrast.css");
const prototypes = [
  ["support-processes/warranty-guided-process.html", "warranty-guided-process"],
  ["support-processes/lost-damaged-claim-process.html", "lost-damaged-claim-process"],
  ["support-processes/returns-process.html", "returns-process-prototype"],
];

assert.equal(fs.existsSync(path.join(root, "guided_processes.js")), false, "old Guided Process JavaScript should be removed");
assert.equal(fs.existsSync(path.join(root, "guided_processes.css")), false, "old Guided Process CSS should be removed");
assert.match(index, /id="supportProcessGuides"/, "new process guide region should exist");
assert.match(index, /data-support-process="warranty"/, "Warranty selector should exist");
assert.match(index, /data-support-process="claim"/, "Lost or Damaged selector should exist");
assert.match(index, /data-support-process="returns"/, "Returns selector should exist");
assert.match(index, /support_processes\.css/, "new process stylesheet should load");
assert.match(index, /dashboard_contrast\.css/, "dashboard contrast stylesheet should load last");
assert.match(index, /support_processes\.js/, "new process controller should load");
assert.match(app, /window\.SupportProcessGuides\?\.render\(\)/, "existing router should call the replacement process module");
assert.doesNotMatch(index, /id="guidedProcessApp"/, "old process mount should be removed");

for (const [file, rootId] of prototypes) {
  const source = read(file);
  assert.match(source, new RegExp(`id=["']${rootId}["']`), `${file} should retain its approved root`);
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, `${file} should contain its approved workflow script`);
  assert.doesNotThrow(() => new Function(script), `${file} workflow script should parse`);
}

const warranty = read(prototypes[0][0]);
const claim = read(prototypes[1][0]);
const returns = read(prototypes[2][0]);

assert.match(warranty, /20% out-of-warranty/, "Warranty should retain the verified OOW branch");
assert.match(warranty, /replacement order number/i, "Warranty should retain the replacement confirmation email");
assert.match(claim, /more than 10 business days/i, "Lost claim should retain the corrected claim timing gate");
assert.match(claim, /UPS Access Point|UPS investigation|all six sides/i, "Claim workflow should retain carrier evidence and investigation content");
assert.match(returns, /Select refund or replacement/, "Returns should require the approved resolution");
assert.match(returns, /Remove or cover any existing waybills/, "Returns should retain the old-label warning");
assert.match(returns, /UPS Access Point/, "Returns should retain the drop-off instruction");

for (const pathText of [
  "support-processes/warranty-guided-process.html",
  "support-processes/lost-damaged-claim-process.html",
  "support-processes/returns-process.html",
]) {
  assert.match(loader, new RegExp(pathText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `loader should request ${pathText}`);
}

assert.match(processCss, /#supportProcessGuides :is\(button, input, select, textarea\):focus-visible/, "workflow focus indicator should be present");
assert.match(processCss, /@media \(max-width: 620px\)/, "workflow mobile layout should be present");
assert.match(contrastCss, /#hubView \.section-heading h2/, "Dashboard heading contrast override should be present");
assert.match(contrastCss, /#hubView \.dashboard-card span:not\(\.card-icon\)/, "Dashboard card-description contrast override should be present");

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255);
  return channels
    .map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

for (const [foreground, background, label] of [
  ["#ffffff", "#061a34", "Dashboard heading"],
  ["#e1edf3", "#061a34", "Dashboard supporting text"],
  ["#061a34", "#f4dfad", "Dashboard card heading"],
  ["#3f4b55", "#f4dfad", "Dashboard card description"],
  ["#74191d", "#f4dfad", "Dashboard kicker"],
]) {
  assert.ok(contrast(foreground, background) >= 4.5, `${label} should meet WCAG AA contrast`);
}

console.log("Support Process static checks passed.");

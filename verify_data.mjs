import fs from "node:fs";

const text = fs.readFileSync("data.js", "utf8");
const json = text.replace(/^window\.KB_DATA = /, "").replace(/;\s*$/, "");
const data = JSON.parse(json);

const checks = {
  records: data.records.length,
  inventory: data.inventory.length,
  specs: data.specs.length,
  links: data.links.length,
  products: data.products.length,
  tickets: data.tickets.length,
  replacementCodes: data.replacementCodes.length,
  formulas: data.formulas.length,
  hasWarranty: data.records.some((item) => /warranty/i.test(`${item.title} ${item.body}`)),
  hasStockSku: data.inventory.some((item) => /MA-/i.test(item.sku)),
  hasGoogleCanned: data.records.some((item) => /Google - Canned Responses Clean/.test(item.sheet)),
  hasReplacementFormula: data.formulas.some((item) => /if\(D/i.test(item.formula)),
};

console.log(JSON.stringify(checks, null, 2));
if (
  !checks.records ||
  !checks.inventory ||
  !checks.specs ||
  !checks.products ||
  !checks.tickets ||
  !checks.replacementCodes ||
  !checks.formulas ||
  !checks.hasWarranty ||
  !checks.hasStockSku ||
  !checks.hasGoogleCanned ||
  !checks.hasReplacementFormula
) {
  process.exit(1);
}

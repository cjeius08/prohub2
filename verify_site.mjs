import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/jabdu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const root = "C:/Users/jabdu/Documents/Codex/2026-05-27/files-mentioned-by-the-user-zich";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });

const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(pathToFileURL(path.join(root, "index.html")).href);
await page.waitForSelector(".card");
await page.fill("#searchInput", "warranty");
await page.waitForTimeout(200);
const visibleCards = await page.locator(".card").count();
await page.click('[data-view="inventory"]');
await page.waitForSelector("#inventoryTable table");
await page.fill("#searchInput", "MA-40");
await page.waitForTimeout(200);
const stockRows = await page.locator("#inventoryTable tbody tr").count();
await page.screenshot({ path: path.join(root, "site-preview.png"), fullPage: true });
await browser.close();

console.log(JSON.stringify({ visibleCards, stockRows, errors }, null, 2));
if (errors.length || visibleCards === 0 || stockRows === 0) {
  process.exit(1);
}

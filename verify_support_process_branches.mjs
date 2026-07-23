import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

function workflowHarness(file, prefix) {
  const source = fs.readFileSync(path.join(rootDir, file), "utf8");
  const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, `${file} script should exist`);

  const instrumented = script.replace(
    /\n\s*render\(\);\s*\n\s*\}\)\(\);\s*$/,
    "\n      globalThis.__workflowTest = { state, advance, render };\n      render();\n    })();",
  );
  assert.notEqual(instrumented, script, `${file} should accept test instrumentation`);

  const makeNode = () => ({
    innerHTML: "",
    textContent: "",
    value: "",
    style: {},
    disabled: false,
    setAttribute() {},
    focus() {},
    select() {},
  });
  const selectors = [
    `#${prefix}-step-list`,
    `#${prefix}-step-content`,
    `#${prefix}-actions`,
    `#${prefix}-error`,
    `#${prefix}-step-count`,
    `#${prefix}-overall-status`,
    `#${prefix}-current-status`,
    `#${prefix}-current-title`,
    `#${prefix}-next-action`,
    `.${prefix}-progress-track`,
    `.${prefix}-progress-value`,
  ];
  const nodes = Object.fromEntries(selectors.map((selector) => [selector, makeNode()]));
  const eventListeners = {};
  const root = {
    querySelector(selector) {
      if (!nodes[selector]) throw new Error(`${file} requested unexpected selector ${selector}`);
      return nodes[selector];
    },
    addEventListener(type, listener) {
      eventListeners[type] = listener;
    },
  };
  const context = {
    console,
    document: { getElementById: () => root },
    navigator: { clipboard: { writeText: async () => {} } },
    setTimeout,
  };
  vm.runInNewContext(instrumented, context, { filename: file });
  assert.ok(context.__workflowTest, `${file} should expose its test controls`);

  return {
    ...context.__workflowTest,
    content: nodes[`#${prefix}-step-content`],
    error: nodes[`#${prefix}-error`],
  };
}

function warrantyHarness() {
  return workflowHarness("support-processes/warranty-guided-process.html", "wgp");
}

function claimHarness() {
  return workflowHarness("support-processes/lost-damaged-claim-process.html", "ldc");
}

function returnsHarness() {
  return workflowHarness("support-processes/returns-process.html", "ret");
}

function runWarrantySuccess(source, olderRegistration = false, newCustomer = false) {
  const test = warrantyHarness();
  const { state, advance, content } = test;
  Object.assign(state, { exactModel: "MA-40", outcome: "not-resolved" });
  advance();
  Object.assign(state, { videoReceived: true, source });
  advance();
  Object.assign(state, {
    medifyOrderFound: source === "medify" ? "yes" : "",
    proofReceived: source !== "medify",
    originalOrder: "ORDER-100",
    warrantyVerified: true,
  });
  advance();
  if (olderRegistration) {
    Object.assign(state, {
      registration: "older",
      completeName: "Alex Customer",
      address: "123 Test Street",
      email: "alex@example.com",
      phone: "555-0100",
    });
  } else {
    Object.assign(state, { registration: "recent", registeredInfoReviewed: true });
  }
  advance();
  Object.assign(state, {
    customerExists: newCustomer ? "no" : "yes",
    customerRecordReviewed: !newCustomer,
    customerCreated: newCustomer,
  });
  advance();
  Object.assign(state, {
    replacementModel: "MA-40",
    replacementCode: "WR-TEST",
    replacementOrder: "REPL-200",
    orderReviewed: true,
    orderCreated: true,
  });
  advance();
  assert.match(content.innerHTML, /REPL-200/, `${source} confirmation should include the new order`);
  assert.match(content.innerHTML, /1–3 business days/, `${source} confirmation should include processing time`);
  assert.match(content.innerHTML, /3–7 business days/, `${source} confirmation should include delivery time`);
  Object.assign(state, { customerNotified: true });
  advance();
  assert.equal(state.step, 7, `${source} warranty route should complete`);
  assert.match(content.innerHTML, /Warranty replacement completed/, `${source} outcome should be verified`);
}

{
  const { state, advance, content } = warrantyHarness();
  Object.assign(state, { exactModel: "MA-25", outcome: "resolved" });
  advance();
  assert.equal(state.closedMode, "resolved");
  assert.match(content.innerHTML, /Resolved during troubleshooting/);
}

{
  const { state, advance, content } = warrantyHarness();
  Object.assign(state, { exactModel: "MA-50", outcome: "not-resolved" });
  advance();
  Object.assign(state, { videoReceived: true, source: "unauthorized" });
  advance();
  Object.assign(state, { oowApproved: true, oowShared: true });
  advance();
  assert.equal(state.closedMode, "oow");
  assert.match(content.innerHTML, /Out-of-warranty option provided/);
}

runWarrantySuccess("medify");
runWarrantySuccess("reseller", true, true);
runWarrantySuccess("amazon");

function startLostScenario(scenario) {
  const test = claimHarness();
  Object.assign(test.state, { claimType: "lost", customerName: "Alex" });
  test.advance();
  test.state.lostScenario = scenario;
  test.advance();
  return test;
}

function fileClaim(test) {
  Object.assign(test.state, {
    orderNumber: "ORDER-300",
    trackingNumber: "1ZTEST",
    claimNumber: "CLAIM-400",
    claimFiled: true,
    claimEmailSent: true,
  });
  test.advance();
}

function createClaimReplacement(test) {
  Object.assign(test.state, {
    customerName: "Alex",
    replacementItem: "MA-40",
    replacementOrder: "REPL-500",
    replacementConfirmed: true,
  });
  test.advance();
  assert.match(test.content.innerHTML, /REPL-500/);
  test.state.customerNotified = true;
  test.advance();
  assert.equal(test.state.finalMode, "replacement");
}

{
  const test = startLostScenario("correct-address-missing");
  Object.assign(test.state, {
    cctvChecked: true,
    neighborsChecked: true,
    buildingCheck: "checked",
    packageFound: "yes",
  });
  test.advance();
  assert.equal(test.state.finalMode, "found");
  assert.match(test.content.innerHTML, /package has been located/i);
}

{
  const test = startLostScenario("old-address");
  Object.assign(test.state, { oldAddressConfirmed: true, customerInsists: "no" });
  test.advance();
  assert.equal(test.state.finalMode, "old-address");
  assert.match(test.content.innerHTML, /unable to process a replacement/i);
}

for (const scenario of ["delayed", "stuck"]) {
  const test = startLostScenario(scenario);
  test.state.businessDays = "10";
  test.advance();
  assert.equal(test.state.finalMode, "within-window", `${scenario} should wait at 10 business days`);
  assert.match(test.content.innerHTML, /still within the delivery timeframe of up to 10 business days/i);
}

{
  const test = startLostScenario("stuck");
  test.state.businessDays = "11";
  test.advance();
  fileClaim(test);
  test.state.approvalStatus = "pending";
  test.advance();
  assert.equal(test.state.finalMode, "blocked");
  assert.match(test.content.innerHTML, /up to 10 business days/i);
}

{
  const test = startLostScenario("delayed");
  test.state.businessDays = "11";
  test.advance();
  fileClaim(test);
  test.state.approvalStatus = "denied";
  test.advance();
  assert.equal(test.state.finalMode, "denied");
}

{
  const test = startLostScenario("wrong-address");
  Object.assign(test.state, { orderAddressCorrect: true, upsWrongAddress: true });
  test.advance();
  fileClaim(test);
  test.state.approvalStatus = "approved";
  test.advance();
  createClaimReplacement(test);
}

{
  const test = startLostScenario("correct-address-missing");
  Object.assign(test.state, {
    cctvChecked: true,
    neighborsChecked: true,
    buildingCheck: "not-applicable",
    packageFound: "no",
  });
  test.advance();
  fileClaim(test);
  test.state.approvalStatus = "approved";
  test.advance();
  createClaimReplacement(test);
}

{
  const test = startLostScenario("old-address");
  Object.assign(test.state, { oldAddressConfirmed: true, customerInsists: "yes" });
  test.advance();
  test.state.approvalStatus = "approved";
  test.advance();
  createClaimReplacement(test);
}

function startDamageScenario(scenario) {
  const test = claimHarness();
  Object.assign(test.state, { claimType: "damaged", customerName: "Alex" });
  test.advance();
  Object.assign(test.state, {
    damageScenario: scenario,
    damageDescription: "Visible damage",
    damageRequestSent: true,
    materialsKept: true,
  });
  test.render();
  assert.match(test.content.innerHTML, /shipping label/i);
  test.advance();
  Object.assign(test.state, {
    photoDamage: true,
    photoLabel: true,
    photoSixSides: true,
    damagedItemsKept: true,
    photoPackaging: scenario === "transit",
    photoCertificate: scenario === "transit",
  });
  test.advance();
  return test;
}

{
  const test = startDamageScenario("item-only");
  assert.equal(test.state.step, 5, "item-only damage should proceed directly to replacement after evidence");
  createClaimReplacement(test);
}

{
  const test = startDamageScenario("transit");
  assert.equal(test.state.step, 3, "transit damage should require a filed UPS claim");
  fileClaim(test);
  assert.equal(test.state.step, 5, "transit damage should proceed after the filed claim and evidence");
  createClaimReplacement(test);
}

function startReturn(days, approvalStatus = "") {
  const test = returnsHarness();
  Object.assign(test.state, { customerName: "Alex", orderNumber: "ORDER-600", daysSinceReceipt: String(days) });
  test.advance();
  Object.assign(test.state, { returnReason: "Changed mind", approvalStatus });
  return test;
}

{
  const test = startReturn(31, "pending");
  test.advance();
  assert.equal(test.state.finalMode, "approval-pending");
  assert.match(test.content.innerHTML, /No return shipping label has been issued/i);
}

{
  const test = startReturn(31, "denied");
  test.advance();
  assert.equal(test.state.finalMode, "late-denied");
  assert.match(test.content.innerHTML, /outside our 30-day return window/i);
}

{
  const test = startReturn(12);
  test.advance();
  Object.assign(test.state, { itemType: "filters", itemDescription: "MA-40 filters", filterSealed: "no" });
  test.advance();
  assert.equal(test.state.finalMode, "unsealed-filter");
}

{
  const test = startReturn(12);
  test.advance();
  Object.assign(test.state, { itemType: "unit", itemDescription: "MA-40", originalPackaging: true });
  test.advance();
  Object.assign(test.state, { photoRequestSent: true, itemPhotosReceived: true, shippingLabelPhotoReceived: true });
  test.advance();
  Object.assign(test.state, { conditionDecision: "ineligible", conditionNotes: "Item is not in good condition" });
  test.advance();
  assert.equal(test.state.finalMode, "condition-denied");
}

function runSuccessfulReturn(resolution, late = false) {
  const test = startReturn(late ? 35 : 12, late ? "approved" : "");
  if (late) test.state.approvalReference = "Supervisor approval";
  test.advance();
  Object.assign(test.state, {
    itemType: "both",
    itemDescription: "MA-40 and sealed filters",
    originalPackaging: true,
    filterSealed: "yes",
  });
  test.advance();
  Object.assign(test.state, {
    photoRequestSent: true,
    itemPhotosReceived: true,
    shippingLabelPhotoReceived: true,
    sealedFilterPhotoReceived: true,
  });
  test.advance();
  Object.assign(test.state, { conditionDecision: "eligible", conditionNotes: "Original packaging and good condition" });
  test.advance();
  Object.assign(test.state, { returnTracking: "1ZRETURN", returnResolution: resolution, labelGenerated: true });
  test.advance();
  assert.match(test.content.innerHTML, /Remove or cover any existing waybills/);
  assert.match(test.content.innerHTML, /UPS Access Point/);
  assert.match(test.content.innerHTML, new RegExp(`process your ${resolution} immediately`));
  test.state.customerNotified = true;
  test.advance();
  assert.equal(test.state.finalMode, "success");
}

runSuccessfulReturn("refund");
runSuccessfulReturn("replacement", true);

console.log("Support Process branch checks passed.");

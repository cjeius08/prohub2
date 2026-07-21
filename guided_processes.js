(function () {
  "use strict";

  const STORAGE_KEY = "medify-guided-process-v1";

  const sources = {
    warrantyHandling: {
      title: "Warranty Handling",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/warranty-handling",
      date: "Undated KB page",
    },
    warrantyRegistration: {
      title: "Warranty Registration",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/warranty-registration",
      date: "Undated KB page",
    },
    registrationMethod: {
      title: "Warranty Registration Purchase Method",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/warranty-registration-purchase-method",
      date: "February 21, 2026",
    },
    paProgram: {
      title: "PA Department of Health Warranty Inquiries",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/pa-dept-of-health-warranty-inquiries",
      date: "February 6, 2026",
    },
    registryChecks: {
      title: "Warranty Registry Checks",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/warranty-registry-checks",
      date: "April 14, 2025",
    },
    warrantyClaims: {
      title: "Warranty Claims",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/warranty-claims",
      date: "March 26, 2025",
    },
    replacementCodes: {
      title: "Replacement Order Codes",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/replacement-order-codes",
      date: "February 6, 2025",
    },
    warrantyUpdate: {
      title: "What's New Regarding Warranty Returns & Replacement Handling",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/whats-new-regarding-warranty-returns-replacement-handling",
      date: "January 27, 2025",
    },
    lifetimeWarranty: {
      title: "New Lifetime Warranty Guidelines",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/new-lifetime-warranty-guidelines",
      date: "July 15, 2024",
    },
    replacementRequest: {
      title: "Replacement Request",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/replacement-request",
      date: "Undated KB page",
    },
    voiceDamage: {
      title: "Voice Handling — Damage/Defective",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/voice-handling-damagedefective",
      date: "Undated KB page",
    },
    draftOrder: {
      title: "Creating Draft Order",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/creating-draft-order",
      date: "Undated KB page",
    },
    lostPackage: {
      title: "Lost, Missing, or Damaged Package",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/lostmissing-or-damage-package",
      date: "Undated KB page",
    },
    upsClaim: {
      title: "UPS — File a Claim",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/ups-file-a-claim",
      date: "Undated KB page",
    },
    orderReturns: {
      title: "Order Returns",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/order-returns",
      date: "Undated KB page",
    },
    returnLabels: {
      title: "Creating Return Labels",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/creating-return-labels",
      date: "Undated KB page",
    },
    refundRequest: {
      title: "Refund Request",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/refund-request",
      date: "Undated KB page",
    },
    returnTracking: {
      title: "Returns & Refund Tracking",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/csr/returns-refund-tracking",
      date: "Undated KB page",
    },
    returnWarehouse: {
      title: "Return Warehouse",
      url: "https://sites.google.com/wagmisolutions.io/medify-air-internal-kb/return-warehouse",
      date: "Undated KB page",
    },
  };

  const item = (id, label, options = {}) => ({ id, label, required: true, ...options });
  const option = (value, label, detail) => ({ value, label, detail });
  const decision = (id, prompt, options, help = "Select the verified answer.") => ({ id, prompt, options, help, required: true });
  const step = (id, title, purpose, config = {}) => ({
    id,
    title,
    purpose,
    why: config.why || "Completing this checkpoint keeps the next action accurate and traceable.",
    requiredInfo: config.requiredInfo || [],
    checklist: config.checklist || [],
    decisions: config.decisions || [],
    evidence: config.evidence || [],
    guidance: config.guidance || [],
    warning: config.warning || "Confirm the applicable policy before promising an outcome.",
    sources: config.sources || [],
    communication: config.communication || {},
  });

  const workflows = {
    warranty: {
      id: "warranty",
      name: "Warranty Claim & Replacement",
      navName: "Warranty",
      icon: "W",
      description: "Qualify the concern, verify coverage, troubleshoot, collect evidence, and confirm the approved next action.",
      issueDecision: "warranty_issue",
      requestDecision: "requested_resolution",
      branches: {
        defective: {
          label: "Defective unit",
          route: "Warranty troubleshooting",
          notes: {
            "w-troubleshoot": "Complete model-specific troubleshooting. If the unit remains defective, capture the result and required video or photo evidence.",
            "w-action": "The March 26, 2025 update says defective units should not be returned. Confirm qualification before creating the replacement.",
          },
        },
        delivery_damage: {
          label: "Damaged upon delivery",
          route: "UPS damage-claim branch",
          notes: {
            "w-verify": "Verify tracking and delivery condition, then use the shipping-damage evidence standard.",
            "w-evidence": "Collect packaging, label, six-side box, certificate (when applicable), and damage photos before moving forward.",
            "w-action": "Continue in the Lost/Damaged workflow for carrier-claim handling; do not treat transit damage as ordinary product failure.",
          },
        },
        customer_damage: {
          label: "Customer-caused damage",
          route: "Exception or paid-resolution review",
          notes: {
            "w-eligibility": "Accidental or customer-caused damage is not automatically covered. Document facts neutrally and escalate exceptions.",
            "w-fees": "Do not quote a fee or discount until the current exception path is confirmed.",
          },
        },
        filter: {
          label: "Filter concern",
          route: "Filter / order issue review",
          notes: {
            "w-eligibility": "The March 2025 warranty page excludes filters, while WR-06 exists for damaged/defective filters. Confirm the scenario before selecting a code.",
            "w-action": "Route wrong-item, transit-damage, and return cases to the matching order workflow. Escalate unclear WR-06 use.",
          },
        },
        part_cord: {
          label: "Part or power-cord request",
          route: "Parts availability / WR-04 review",
          notes: {
            "w-troubleshoot": "Confirm the exact model and part, and rule out outlet or removable-cord issues where safe.",
            "w-action": "Check current inventory and use WR-04 only when the verified concern matches the code guidance.",
          },
        },
        amazon: {
          label: "Amazon order",
          route: "Amazon proof-of-purchase review",
          notes: {
            "w-verify": "Confirm the seller and obtain acceptable Amazon proof of purchase. Do not assume every marketplace seller is authorized.",
          },
        },
        reseller: {
          label: "Reseller order",
          route: "Reseller eligibility review",
          notes: {
            "w-verify": "Identify the reseller, country, and proof of purchase. Apply any current reseller or regional exception before continuing.",
            "w-action": "Escalate when reseller authorization, fulfillment ownership, or replacement channel is unclear.",
          },
        },
        gift: {
          label: "Gift",
          route: "Gift proof / registration review",
          notes: {
            "w-verify": "Ask for available gift receipt or purchaser proof without promising eligibility before registry review.",
          },
        },
        special_program: {
          label: "Special program",
          route: "Program-specific escalation",
          notes: {
            "w-verify": "Confirm the program name and follow the newest program exception. PA Department of Health inquiries have a dated 2026 update.",
            "w-action": "Use the program-specific escalation path; do not create a standard replacement unless authorized.",
          },
        },
        discontinued: {
          label: "Discontinued / unavailable model",
          route: "Equivalent-model escalation",
          notes: {
            "w-troubleshoot": "Verify the exact model and document that it is discontinued or unavailable.",
            "w-action": "Do not select an equivalent model by guessing. Escalate for the currently approved replacement.",
          },
        },
      },
      contextRules: [
        { decision: "delivery_damage", value: "yes", from: 1, title: "Route updated: UPS damage claim", text: "The agent confirmed delivery damage. Use shipping evidence and continue the carrier-claim path before promising a warranty replacement." },
        { decision: "eligibility", value: "no", from: 4, title: "Not verified as eligible", text: "Pause replacement creation. Explain only what is verified and escalate any requested exception." },
        { decision: "eligibility", value: "unclear", from: 4, title: "Pending verification", text: "Mark the case Pending Customer or Escalated to L2 and identify the missing verification item." },
      ],
      steps: [
        step("w-classify", "Classify concern", "Identify the primary concern and the customer's requested outcome before selecting a path.", {
          requiredInfo: ["Customer's description of the issue", "When and how the issue began", "Requested resolution"],
          checklist: [item("concern_captured", "Issue described and categorized"), item("safety_checked", "Immediate safety concern checked"), item("request_captured", "Requested resolution confirmed")],
          decisions: [
            decision("warranty_issue", "Which path best matches the concern?", [
              option("defective", "Defective unit", "Continue with model-specific troubleshooting."),
              option("delivery_damage", "Damaged upon delivery", "Open the UPS damage-claim route."),
              option("customer_damage", "Customer-caused damage", "Review exclusions or escalation."),
              option("filter", "Filter concern", "Separate warranty, return, and delivery scenarios."),
              option("part_cord", "Part or power-cord request", "Confirm part and model availability."),
              option("amazon", "Amazon order", "Verify seller and marketplace proof."),
              option("reseller", "Reseller order", "Check reseller and regional rules."),
              option("gift", "Gift", "Review available purchaser proof and registration."),
              option("special_program", "Special program", "Use the applicable program exception."),
              option("discontinued", "Discontinued / unavailable model", "Escalate the equivalent-model decision."),
            ]),
            decision("delivery_damage", "Was the item damaged during delivery?", [
              option("yes", "Yes", "Open the UPS damage-claim branch."),
              option("no", "No", "Continue with warranty troubleshooting."),
              option("unclear", "Not sure", "Collect delivery-condition details before proceeding."),
            ]),
            decision("requested_resolution", "What resolution did the customer request?", [
              option("troubleshooting", "Troubleshooting", "Customer wants help restoring operation."),
              option("replacement", "Replacement", "Request noted; approval is not implied."),
              option("refund", "Refund", "Request noted; warranty does not automatically authorize it."),
              option("other", "Other / unsure", "Clarify during the process."),
            ]),
          ],
          guidance: ["Use neutral language until cause and eligibility are verified.", "If there is smoke, overheating, exposed wiring, or another safety concern, stop ordinary troubleshooting and escalate."],
          evidence: ["Initial customer description", "Delivery condition when relevant"],
          warning: "A requested resolution is not an approved resolution. Do not promise a replacement or refund here.",
          sources: [sources.warrantyHandling, sources.voiceDamage, sources.upsClaim],
        }),
        step("w-verify", "Verify order and purchase source", "Confirm the purchase record, seller, region, and ownership path.", {
          requiredInfo: ["Order or receipt available in the authorized system", "Purchase date and source", "Seller, country, gift, reseller, or program context"],
          checklist: [item("order_verified", "Order or acceptable proof located"), item("source_verified", "Purchase source and seller verified"), item("region_verified", "Country or program exception checked")],
          decisions: [decision("purchase_source", "Where was the unit purchased?", [
            option("medify", "Medify Air", "Continue with direct-order verification."),
            option("amazon", "Amazon", "Verify seller and acceptable marketplace proof."),
            option("reseller", "Reseller / business", "Check authorization and fulfillment ownership."),
            option("gift", "Gift", "Use available purchaser documentation and registry review."),
            option("special_program", "Special program", "Apply the newest program exception."),
            option("unknown", "Unknown", "Mark Pending Customer or escalate verification."),
          ])],
          guidance: ["Review the order inside the authorized system; never paste customer identifiers into this Navigator.", "The February 2026 update changes how purchase method is captured during registration."],
          evidence: ["Proof of purchase or receipt", "Seller information when applicable"],
          warning: "Do not treat an unverified marketplace seller, gift, reseller, or special-program unit as a standard direct order.",
          sources: [sources.registrationMethod, sources.paProgram, sources.warrantyHandling],
        }),
        step("w-troubleshoot", "Identify model and troubleshoot", "Verify the exact purifier or part and complete the supported diagnostic path.", {
          requiredInfo: ["Exact model and affected component", "Symptoms, lights, sound, odor, power behavior", "Troubleshooting already attempted"],
          checklist: [item("model_verified", "Exact model verified"), item("steps_completed", "Model-specific troubleshooting completed"), item("result_recorded", "Troubleshooting result documented")],
          decisions: [decision("troubleshooting_result", "What was the troubleshooting result?", [
            option("resolved", "Resolved", "Document the working resolution; replacement is not needed."),
            option("not_resolved", "Not resolved", "Continue to eligibility and evidence."),
            option("not_safe", "Not safe to continue", "Stop and escalate with the safety details."),
            option("not_applicable", "Not applicable", "Document why troubleshooting does not apply."),
          ])],
          guidance: ["Use the existing model-specific Troubleshooting tab for exact steps.", "Never instruct a customer to open a sealed electrical housing or perform unsafe tests."],
          evidence: ["Video or audio when requested by the model procedure", "Photos of display, cord, or component when relevant"],
          warning: "Troubleshooting must match the exact model. A similar model's reset procedure may not apply.",
          sources: [sources.warrantyHandling, sources.voiceDamage],
        }),
        step("w-eligibility", "Check eligibility and registration", "Confirm registration, timing, coverage, and any applicable exception.", {
          requiredInfo: ["Warranty registration status", "Purchase and registration dates", "Coverage exclusion or special exception"],
          checklist: [item("registry_checked", "Registration checked through the authorized route"), item("window_checked", "Registration and coverage timing checked"), item("exception_checked", "Exclusions and applicable exceptions reviewed")],
          decisions: [decision("eligibility", "Is warranty eligibility fully verified?", [
            option("yes", "Yes", "Continue to evidence and resolution."),
            option("no", "No", "Do not create a warranty replacement; review escalation or alternatives."),
            option("unclear", "Not yet", "Mark Pending Verification or Escalate to L2."),
          ])],
          guidance: ["Registry checks follow the April 2025 lead-supported route.", "The July 2024 update says registration is required within 90 days and warranty is no longer contingent on genuine-filter cadence."],
          evidence: ["Registration result", "Purchase date supporting the eligibility decision"],
          warning: "Filter coverage and legacy filter-cadence wording conflict with newer updates. Use the dated guidance and escalate unclear filter cases.",
          sources: [sources.registryChecks, sources.warrantyClaims, sources.lifetimeWarranty, sources.warrantyRegistration],
        }),
        step("w-evidence", "Collect proof and evidence", "Gather only the material required to support the verified concern and decision.", {
          requiredInfo: ["Acceptable proof of purchase", "Model and serial evidence when required", "Photos, video, or delivery evidence matching the concern"],
          checklist: [item("proof_received", "Required proof of purchase received", { evidence: true }), item("model_evidence", "Model / serial evidence received when required", { evidence: true }), item("issue_evidence", "Issue-specific photo or video received", { evidence: true })],
          guidance: ["Keep evidence in the authorized ticket or order system, not in browser storage.", "For delivery damage, use the UPS evidence checklist instead of a generic product photo request."],
          evidence: ["Receipt or order proof", "Model label", "Video, audio, or photos tied to the diagnosed concern"],
          warning: "Do not request unrelated personal information or save evidence in this Navigator.",
          sources: [sources.warrantyHandling, sources.warrantyClaims, sources.upsClaim],
        }),
        step("w-fees", "Determine fees, exceptions, or escalation", "Verify whether a replacement-shipping fee, no-fee rule, or escalation applies.", {
          requiredInfo: ["Verified cause and timing", "Current model tier", "Customer-at-fault, no-fault, or exception determination"],
          checklist: [item("fee_rule_checked", "Current fee rule and model tier checked"), item("exception_reviewed", "No-fee or program exception reviewed"), item("expectation_set", "Only verified costs and next steps communicated")],
          decisions: [decision("fee_status", "What is the verified fee path?", [
            option("no_fee", "No fee applies", "Document the exact rule supporting the decision."),
            option("fee_confirmed", "Fee confirmed", "Use only the current model-tier amount from the dated update."),
            option("exception", "Exception requested", "Escalate before quoting or charging."),
            option("unclear", "Not confirmed", "Pause and escalate the fee decision."),
          ])],
          guidance: ["The January 2025 update contains model-tier replacement-shipping fees and no-fee exceptions.", "Do not infer a fee from purifier size or an older template."],
          evidence: ["Policy basis for fee or waiver", "Escalation approval when applicable"],
          warning: "Fee amounts and exceptions must come from the newest applicable source. Do not guess or paraphrase an unverified amount.",
          sources: [sources.warrantyUpdate, sources.paProgram],
        }),
        step("w-action", "Create or escalate replacement", "Take the approved action, use the correct reason code, and confirm it actually occurred.", {
          requiredInfo: ["Approved action path", "Correct replacement reason code", "Available equivalent for discontinued models"],
          checklist: [item("path_approved", "Action path approved or escalated"), item("code_checked", "Correct WR reason code checked"), item("replacement_created", "I confirmed the replacement or draft order was created", { required: false, confirms: "replacement_created", evidence: true }), item("escalation_sent", "I confirmed the case was escalated", { required: false, confirms: "escalation_sent", evidence: true })],
          decisions: [decision("warranty_action", "Which action is being taken?", [
            option("replacement", "Create approved replacement", "Check the completion box only after creation succeeds."),
            option("escalate", "Escalate for decision", "Document owner and pending question."),
            option("resolved", "Resolved without replacement", "Document the verified troubleshooting resolution."),
            option("no_action", "No covered action", "Explain only the verified eligibility decision."),
          ])],
          guidance: ["WR-01 Noise; WR-02 Odor; WR-03 LED/control panel; WR-04 Power/cord; WR-05 Damaged on delivery; WR-06 Filter; WR-07 Fan; WR-08 Other.", "For defective units, the March 2025 update says no return is required. Discontinued-equivalent decisions require confirmation."],
          evidence: ["Approved replacement record or escalation confirmation"],
          warning: "Selecting an action does not prove it was completed. Use the confirmation checkbox only after the authorized system shows success.",
          sources: [sources.replacementCodes, sources.warrantyClaims, sources.replacementRequest, sources.draftOrder],
        }),
        step("w-document", "Document and send update", "Create a complete case record and send a customer update that matches only confirmed actions.", {
          requiredInfo: ["Issue and checks completed", "Confirmed action and current status", "Owner and next follow-up"],
          checklist: [item("tag_added", "CS_Wty tag and required ticket fields checked"), item("notes_added", "Internal notes added to the authorized ticket"), item("customer_updated", "Customer update sent with accurate expectation"), item("pending_owner", "Pending owner and next action documented")],
          guidance: ["Review the generated summary before copying it.", "Replace placeholders only in the authorized customer channel; never paste customer data into this page."],
          evidence: ["Ticket note saved", "Customer contact recorded"],
          warning: "Do not say a replacement was created unless the completion confirmation was checked in Step 7.",
          sources: [sources.warrantyHandling, sources.replacementRequest],
        }),
      ],
    },

    shipping: {
      id: "shipping",
      name: "Lost, Missing, or Damaged Package",
      navName: "Lost / Damaged",
      icon: "UPS",
      description: "Verify tracking, classify the shipment issue, prepare a UPS claim when eligible, and monitor the approved resolution.",
      issueDecision: "shipping_issue",
      requestDecision: "requested_resolution",
      branches: {
        lost: { label: "Entire package lost", route: "UPS lost-package claim", notes: { "s-delivery": "Verify the last carrier scan and any investigation already completed.", "s-evidence": "Lost-package claims may rely on tracking and value records rather than damage photos.", "s-file": "File only after current waiting and eligibility requirements are confirmed." } },
        delivered_missing: { label: "Marked delivered, not received", route: "Delivery-location investigation", notes: { "s-delivery": "Review proof of delivery, household or neighbor checks, delivery location, and any applicable wait instruction.", "s-eligibility": "The KB contains conflicting 3-day and 5-day waiting instructions. Confirm the current requirement before filing." } },
        missing_item: { label: "Missing item", route: "Package-count / fulfillment review", notes: { "s-verify": "Confirm whether the order has multiple tracking numbers before treating an item as missing.", "s-resolution": "Resolve only the verified missing SKU or package; do not replace the entire order by default." } },
        damaged: { label: "Damaged package or product", route: "UPS damage claim", notes: { "s-evidence": "Collect all six sides, the shipping label, packaging material, product damage, and box certificate when applicable.", "s-file": "Retain the damaged item and packaging until the carrier path is complete unless authorized instructions say otherwise." } },
        wrong_item: { label: "Wrong item", route: "Fulfillment / return resolution", notes: { "s-eligibility": "Confirm whether this is a warehouse fulfillment issue rather than a carrier loss claim.", "s-resolution": "Use the Returns workflow for label and replacement/refund handling when appropriate." } },
        stuck: { label: "Stuck shipment", route: "Carrier movement review", notes: { "s-delivery": "Verify the last scan and current carrier status; do not call a package lost solely because movement paused.", "s-monitor": "Set the next review point using the currently confirmed instruction." } },
        multiple: { label: "Multiple tracking numbers", route: "Split-shipment verification", notes: { "s-verify": "Match each SKU or box to its tracking number before opening any claim.", "s-resolution": "Act only on the package or item that is actually missing or damaged." } },
      },
      contextRules: [
        { decision: "claim_eligibility", value: "no", from: 5, title: "Claim not verified as eligible", text: "Do not file a UPS claim. Document the reason and use the appropriate fulfillment, return, or escalation path." },
        { decision: "claim_eligibility", value: "unclear", from: 5, title: "Claim eligibility pending", text: "Pause filing and identify the missing date, tracking event, evidence, or ownership decision." },
      ],
      steps: [
        step("s-verify", "Verify order and tracking", "Match the order, items, shipment count, and carrier records before classifying the issue.", {
          requiredInfo: ["Order and item list", "Every tracking number", "Ship-to information reviewed in the authorized system"],
          checklist: [item("order_verified", "Order and affected item verified"), item("tracking_verified", "All tracking numbers checked"), item("package_count", "Package count and split shipment checked")],
          guidance: ["Check the live carrier record and the order's shipment breakdown.", "Do not store order or tracking numbers in this Navigator."],
          evidence: ["Carrier scan history", "Order package breakdown"],
          warning: "A partial delivery may be a normal split shipment. Verify every tracking number first.",
          sources: [sources.lostPackage],
        }),
        step("s-classify", "Classify shipping issue", "Choose the route that best matches the verified carrier and fulfillment facts.", {
          requiredInfo: ["Carrier status", "Which package or item is affected", "Customer's requested resolution"],
          checklist: [item("issue_classified", "Shipping issue classified"), item("affected_item", "Affected package or item identified"), item("request_captured", "Requested resolution confirmed")],
          decisions: [
            decision("shipping_issue", "Which shipping issue is verified?", [
              option("lost", "Entire package lost", "Prepare the lost-package claim path."),
              option("delivered_missing", "Marked delivered, not received", "Complete delivery-location checks first."),
              option("missing_item", "Missing item", "Confirm split shipments and fulfillment."),
              option("damaged", "Damaged package or product", "Use the complete damage evidence list."),
              option("wrong_item", "Wrong item", "Route to fulfillment / return handling."),
              option("stuck", "Stuck shipment", "Review movement and current wait guidance."),
              option("multiple", "Multiple tracking numbers", "Map each item to the correct package."),
            ]),
            decision("requested_resolution", "What resolution did the customer request?", [
              option("replacement", "Replacement", "Request noted; carrier or fulfillment approval is not implied."),
              option("refund", "Refund", "Request noted; do not promise it before approval."),
              option("missing_item", "Send missing item", "Verify which SKU or package is missing."),
              option("other", "Other / unsure", "Clarify during the investigation."),
            ]),
          ],
          guidance: ["Use issue facts, not the requested outcome, to select the route.", "Wrong-item and extra-item cases may belong in the Returns workflow rather than a UPS claim."],
          evidence: ["Tracking status supporting the selected route"],
          warning: "Do not open a carrier claim for a package that is still moving or for an unverified split shipment.",
          sources: [sources.lostPackage, sources.upsClaim, sources.orderReturns],
        }),
        step("s-delivery", "Review delivery information", "Complete the route-specific delivery, movement, address, and package checks.", {
          requiredInfo: ["Last scan and delivery status", "Proof-of-delivery details when available", "Package location checks and shipment count"],
          checklist: [item("scan_reviewed", "Latest carrier scan reviewed"), item("delivery_reviewed", "Delivery or movement details reviewed"), item("checks_completed", "Route-specific customer checks completed")],
          guidance: ["For marked-delivered cases, use the source's delivery-location checks before escalating.", "For stuck shipments, confirm current timing guidance because the base page contains inconsistent wait language."],
          evidence: ["Proof of delivery when available", "Carrier event timeline"],
          warning: "The source contains both three-business-day and five-day instructions. Confirm the current wait requirement instead of quoting either one here.",
          sources: [sources.lostPackage],
        }),
        step("s-evidence", "Collect photos and evidence", "Gather the carrier-required evidence for the selected lost or damage route.", {
          requiredInfo: ["Evidence matched to affected item", "Shipping-label image when required", "Packaging and damage views when applicable"],
          checklist: [item("tracking_evidence", "Tracking or proof-of-delivery evidence received", { evidence: true }), item("package_photos", "Required packaging photos received or marked not applicable", { evidence: true }), item("damage_photos", "Required item-damage photos received or marked not applicable", { evidence: true })],
          guidance: ["For damage: request all six sides, shipping label close-up, packaging material, product damage, and box certificate where applicable.", "Keep photos in the authorized ticket; this page stores checklist state only."],
          evidence: ["All six sides of the package", "Shipping-label close-up", "Packaging material", "Product damage close-ups", "Box certificate where applicable"],
          warning: "Incomplete damage evidence can delay or prevent carrier review. Do not upload images into this Navigator.",
          sources: [sources.upsClaim, sources.lostPackage],
        }),
        step("s-eligibility", "Check claim eligibility", "Verify notice timing, carrier ownership, shipment status, and required documentation.", {
          requiredInfo: ["Loss or damage notice date", "Carrier and shipment ownership", "Required evidence availability"],
          checklist: [item("notice_checked", "60-day loss/damage notice requirement checked"), item("ownership_checked", "UPS and Medify claim ownership verified"), item("docs_checked", "Required supporting documents available")],
          decisions: [decision("claim_eligibility", "Is the UPS claim fully verified as eligible?", [
            option("yes", "Yes", "Prepare the claim information."),
            option("no", "No", "Use the correct non-claim resolution or escalation."),
            option("unclear", "Not yet", "Mark pending and identify the missing verification."),
          ])],
          guidance: ["The UPS page says notice of loss or damage must be provided within 60 days after delivery or scheduled delivery.", "Eligibility does not mean the claim is approved."],
          evidence: ["Timing evidence", "Order and tracking ownership"],
          warning: "Do not file or promise a carrier resolution until eligibility and ownership are verified.",
          sources: [sources.upsClaim],
        }),
        step("s-prepare", "Prepare UPS claim information", "Assemble the complete, verified claim record before filing.", {
          requiredInfo: ["Item description and quantity", "Item cost including applicable tax", "Package dimensions, order reference, and recipient details"],
          checklist: [item("item_details", "Item description, quantity, and cost prepared"), item("package_details", "Dimensions and package details prepared"), item("recipient_details", "Order reference and recipient details verified in the authorized system"), item("evidence_attached", "Required evidence attached in the authorized system")],
          guidance: ["Prepare the information in the claim system or ticket, not in this Navigator.", "Cross-check cost, quantity, and affected package before submission."],
          evidence: ["Supporting documents linked to the authorized claim record"],
          warning: "Never copy claim-system credentials or customer personal information into this page.",
          sources: [sources.upsClaim],
        }),
        step("s-file", "File the claim", "Submit the verified claim or document why filing is pending or not applicable.", {
          requiredInfo: ["Verified eligibility result", "Complete claim data", "Submission or escalation outcome"],
          checklist: [item("filing_path", "Filing, pending, or non-claim path selected"), item("claim_filed", "I confirmed the UPS claim was successfully filed", { required: false, confirms: "claim_filed", evidence: true }), item("escalation_sent", "I confirmed an eligibility or filing escalation was sent", { required: false, confirms: "escalation_sent", evidence: true })],
          decisions: [decision("claim_action", "What happened with the claim?", [
            option("file", "File eligible claim", "Confirm submission only after the claim system succeeds."),
            option("pending", "Pending information", "Set the owner and missing requirement."),
            option("not_eligible", "Not eligible / not a UPS claim", "Use the correct fulfillment or return path."),
            option("escalate", "Escalate", "Document the decision needed."),
          ])],
          guidance: ["Add the CS_UPS tag and required ticket fields where applicable.", "A selected filing action is not proof of submission; use the explicit confirmation checkbox."],
          evidence: ["Claim submission confirmation or escalation record"],
          warning: "Do not state that a claim was filed unless the authorized claim system confirmed submission.",
          sources: [sources.upsClaim],
        }),
        step("s-monitor", "Monitor the claim", "Track carrier progress, keep ownership clear, and update the customer without promising an outcome.", {
          requiredInfo: ["Claim status in the authorized system", "Next follow-up date", "Pending owner"],
          checklist: [item("status_checked", "Current UPS claim status checked"), item("followup_set", "Next review point and owner set"), item("customer_expectation", "Customer given a non-promissory update")],
          guidance: ["The UPS KB gives an average of 8–15 business days after supporting documentation is issued.", "Use Pending UPS while the carrier is reviewing; update status only from verified records."],
          evidence: ["Carrier status update", "Customer follow-up record"],
          warning: "The existing Orders page says 8–10 business days; the current UPS page says 8–15. Preserve the old text, but use the sourced 8–15 estimate here and never guarantee it.",
          sources: [sources.upsClaim],
        }),
        step("s-resolution", "Process approved resolution", "Complete only the resolution that was approved and confirm the action in the authorized system.", {
          requiredInfo: ["Carrier or internal decision", "Approved refund, replacement, or other action", "Customer's requested resolution compared with approval"],
          checklist: [item("decision_verified", "Approved resolution verified"), item("replacement_created", "I confirmed the replacement was created", { required: false, confirms: "replacement_created", evidence: true }), item("refund_processed", "I confirmed the refund was processed", { required: false, confirms: "refund_processed", evidence: true }), item("customer_advised", "Customer advised using only confirmed facts")],
          decisions: [decision("shipping_resolution", "What is the approved resolution?", [
            option("replacement", "Replacement approved", "Confirm creation separately after it succeeds."),
            option("refund", "Refund approved", "Confirm processing separately after it succeeds."),
            option("denied", "Claim denied / no approved remedy", "Document the reason and escalation options."),
            option("pending", "Still pending", "Keep Pending UPS or the appropriate owner status."),
          ])],
          guidance: ["Match the action to the approved affected item or package.", "Do not treat carrier approval as proof that a refund or replacement was completed."],
          evidence: ["Approval record", "Completed refund or replacement record when confirmed"],
          warning: "The summary will state a refund or replacement only when its confirmation checkbox is selected.",
          sources: [sources.upsClaim, sources.lostPackage, sources.refundRequest],
        }),
        step("s-document", "Document the case", "Close or hand off the case with a clear timeline, verified action, current status, and next owner.", {
          requiredInfo: ["Issue and affected shipment", "Claim and evidence timeline", "Confirmed resolution or pending action"],
          checklist: [item("tag_checked", "CS_UPS tag and ticket fields checked"), item("notes_saved", "Internal timeline and evidence summary saved"), item("customer_updated", "Customer update sent"), item("owner_recorded", "Pending owner and next action recorded")],
          guidance: ["Review the generated summary and copy only the channel-appropriate version.", "Keep internal claim details out of customer-ready responses."],
          evidence: ["Final ticket note", "Customer contact record"],
          warning: "Do not mark Resolved while a carrier, warehouse, customer, or escalation action remains pending.",
          sources: [sources.lostPackage, sources.upsClaim],
        }),
      ],
    },

    returns: {
      id: "returns",
      name: "Order Return & Refund",
      navName: "Returns",
      icon: "R",
      description: "Verify source and eligibility, choose the correct return route, track the item, and confirm any refund or replacement.",
      issueDecision: "return_reason",
      requestDecision: "requested_resolution",
      branches: {
        change_mind: { label: "Change of mind", route: "Buyer-remorse eligibility", notes: { "r-eligibility": "Check the current return window, condition, and applicable shipping or restocking terms before quoting anything.", "r-resolution": "Use only the currently authorized buyer-remorse resolution." } },
        wrong_filter: { label: "Incorrect filter ordered", route: "Filter return review", notes: { "r-eligibility": "Confirm opened/unopened condition, exact SKU, and the scenario-specific refund trigger.", "r-process": "Some guidance requires warehouse receipt and verification. Do not process early by assumption." } },
        wrong_item: { label: "Wrong item received", route: "Fulfillment-error return", notes: { "r-evidence": "Collect the received item, label, and packaging evidence needed to verify the mismatch.", "r-resolution": "Confirm the correct item and approved replacement or refund path." } },
        extra_package: { label: "Extra package received", route: "Extra-shipment return", notes: { "r-resolution": "Verify the extra item and ownership before creating a return label.", "r-label": "Create a label only after the destination and shipment details are confirmed." } },
        canceled_delivered: { label: "Canceled but delivered", route: "Canceled-order return", notes: { "r-eligibility": "Verify the cancellation and shipment timeline before choosing the resolution.", "r-process": "Refund timing depends on the verified return and current process instruction." } },
        damaged: { label: "Damaged upon delivery", route: "UPS damage claim", notes: { "r-evidence": "Use the carrier damage evidence list, including packaging, label, six sides, and close-ups.", "r-label": "Do not create a standard return label until the UPS damage route is confirmed." } },
        defective: { label: "Defective unit", route: "Warranty qualification", notes: { "r-eligibility": "Complete troubleshooting and warranty qualification. Newer 2025 guidance says defective units do not need to be returned.", "r-label": "Do not create a defective-unit return label unless a newer applicable exception specifically requires it." } },
        reseller: { label: "Reseller or business order", route: "Reseller / B2B exception", notes: { "r-verify": "Confirm seller, fulfillment owner, region, and business-order terms.", "r-resolution": "Escalate when return ownership or fees are not explicitly verified." } },
      },
      contextRules: [
        { decision: "return_eligibility", value: "no", from: 3, title: "Return not verified as eligible", text: "Do not create a label or promise a refund. Document the verified rule and escalate any exception request." },
        { decision: "return_eligibility", value: "unclear", from: 3, title: "Return eligibility pending", text: "Mark Pending Customer or Escalated and identify the missing source, timing, condition, or approval." },
      ],
      steps: [
        step("r-verify", "Verify order and purchase source", "Confirm the order, seller, fulfillment owner, region, and items involved.", {
          requiredInfo: ["Order and affected SKU", "Purchase source and seller", "Country, reseller, or business context"],
          checklist: [item("order_verified", "Order and affected item verified"), item("source_verified", "Purchase source and seller verified"), item("ownership_verified", "Return ownership and region checked")],
          decisions: [decision("return_source", "Where was the item purchased?", [
            option("medify", "Medify Air", "Continue with direct-order rules."),
            option("amazon", "Amazon", "Check marketplace return ownership and seller."),
            option("reseller", "Reseller / business", "Apply the current reseller or B2B exception."),
            option("gift", "Gift", "Verify available purchaser documentation."),
            option("unknown", "Unknown", "Pause eligibility until source is verified."),
          ])],
          guidance: ["Review personal and order details only in the authorized system.", "Do not assume Medify owns a return simply because the product is a Medify model."],
          evidence: ["Order or acceptable proof", "Seller and fulfillment record"],
          warning: "Marketplace, reseller, business, gift, and regional orders may follow different return ownership rules.",
          sources: [sources.orderReturns],
        }),
        step("r-reason", "Select return reason", "Classify why the item is coming back and record the customer's requested resolution.", {
          requiredInfo: ["Return reason", "Item condition and use", "Customer's requested resolution"],
          checklist: [item("reason_verified", "Return reason verified"), item("condition_captured", "Item and packaging condition checked"), item("request_captured", "Requested resolution confirmed")],
          decisions: [
            decision("return_reason", "Which return reason is verified?", [
              option("change_mind", "Change of mind", "Review buyer-remorse terms."),
              option("wrong_filter", "Incorrect filter ordered", "Check SKU and condition."),
              option("wrong_item", "Wrong item received", "Use fulfillment-error evidence."),
              option("extra_package", "Extra package received", "Verify extra-shipment ownership."),
              option("canceled_delivered", "Canceled but still delivered", "Verify cancel and shipment timeline."),
              option("damaged", "Damaged upon delivery", "Open the UPS damage-claim route."),
              option("defective", "Defective unit", "Use warranty troubleshooting and newer no-return guidance."),
              option("reseller", "Reseller or business order", "Apply the seller/program exception."),
            ]),
            decision("requested_resolution", "What resolution did the customer request?", [
              option("refund", "Refund", "Request noted; approval and processing are separate."),
              option("replacement", "Replacement", "Request noted; approval and creation are separate."),
              option("exchange", "Exchange / correct item", "Verify item and approved order path."),
              option("other", "Other / unsure", "Clarify before choosing the resolution."),
            ]),
          ],
          guidance: ["Classify by facts, not by the desired outcome.", "Damaged-delivery and defective-unit cases branch to carrier or warranty handling before a standard return."],
          evidence: ["Customer description", "Condition details"],
          warning: "A return request does not establish eligibility or authorize a refund.",
          sources: [sources.orderReturns, sources.warrantyClaims, sources.lostPackage],
        }),
        step("r-eligibility", "Check eligibility, condition, and fees", "Verify the applicable window, condition, fees, exception, and refund trigger.", {
          requiredInfo: ["Purchase and request timing", "Item and packaging condition", "Applicable return cost, exception, and refund trigger"],
          checklist: [item("timing_checked", "Return timing checked"), item("condition_checked", "Item and packaging condition checked"), item("fees_checked", "Applicable costs or no-cost exception checked"), item("trigger_checked", "Scenario-specific refund trigger checked")],
          decisions: [decision("return_eligibility", "Is the return fully verified as eligible?", [
            option("yes", "Yes", "Continue to the approved resolution."),
            option("no", "No", "Explain the verified rule or escalate an exception."),
            option("unclear", "Not yet", "Mark pending and identify the missing verification."),
          ])],
          guidance: ["Use the scenario-specific return instruction. Do not apply buyer-remorse terms to fulfillment error, damage, or defect cases.", "Refund timing varies by scenario; some guidance requires warehouse receipt and verification."],
          evidence: ["Policy basis for the eligibility result", "Condition evidence when required"],
          warning: "Return-window, fee, and refund-trigger details must be verified from the current applicable source before they are quoted.",
          sources: [sources.orderReturns, sources.refundRequest],
        }),
        step("r-resolution", "Choose appropriate resolution", "Match the verified reason and eligibility to the approved refund, replacement, exchange, or escalation path.", {
          requiredInfo: ["Eligibility decision", "Customer request", "Approved resolution and owner"],
          checklist: [item("request_compared", "Customer request compared with approved options"), item("resolution_verified", "Resolution and owner verified"), item("expectation_set", "Customer expectation set without promising completion")],
          decisions: [decision("return_resolution", "Which resolution is approved?", [
            option("refund", "Refund after verified trigger", "Processing is confirmed separately in Step 8."),
            option("replacement", "Replacement / correct item", "Creation is confirmed separately in Step 8."),
            option("return_only", "Return only / no immediate financial action", "Track the item and follow the approved next step."),
            option("escalate", "Escalate for decision", "Document owner and question."),
          ])],
          guidance: ["Keep requested and approved resolutions distinct.", "For defects or carrier damage, follow the branch-specific process rather than defaulting to a return label."],
          evidence: ["Approval or escalation record"],
          warning: "Do not tell the customer a refund or replacement is complete at this step.",
          sources: [sources.orderReturns, sources.refundRequest, sources.warrantyClaims],
        }),
        step("r-evidence", "Collect photos and return details", "Gather only the condition, item, packaging, and shipment details required by the selected route.", {
          requiredInfo: ["Exact item and quantity", "Condition and packaging", "Photos required by the reason"],
          checklist: [item("item_verified", "Item, quantity, and reason evidence received", { evidence: true }), item("condition_evidence", "Condition and packaging evidence received", { evidence: true }), item("route_evidence", "Route-specific photos received or marked not applicable", { evidence: true })],
          guidance: ["Keep photos and customer details inside the authorized ticket.", "For damaged delivery, use the full UPS evidence standard; for wrong items, show the received SKU and shipping label."],
          evidence: ["Item/SKU photo", "Packaging condition", "Shipping label", "Damage views when applicable"],
          warning: "Do not collect unrelated personal information or upload evidence into this Navigator.",
          sources: [sources.orderReturns, sources.upsClaim],
        }),
        step("r-label", "Create and send return label", "Confirm the destination and shipment settings, create the authorized label, and send accurate packing instructions.", {
          requiredInfo: ["Confirmed return warehouse", "SKU, order reference, and reason", "Package dimensions and service"],
          checklist: [item("warehouse_confirmed", "Return warehouse confirmed from the current instruction"), item("reference_checked", "Reference uses SKU_Order Number_Reason"), item("service_checked", "UPS Ground, dimensions, and no delivery confirmation checked"), item("label_created", "I confirmed the return label was created and sent", { required: false, confirms: "return_label_created", evidence: true })],
          guidance: ["The label page specifies UPS Ground, correct dimensions, and No Delivery Confirmation.", "Tell the customer to cover or remove old labels and pack the item securely."],
          evidence: ["Label record and return tracking in the authorized system"],
          warning: "Warehouse sources conflict. Confirm the destination instead of relying on a hard-coded state map. Creating a label does not mean a refund was processed.",
          sources: [sources.returnLabels, sources.returnWarehouse, sources.orderReturns],
        }),
        step("r-track", "Track the return", "Monitor the label and physical return, keep ownership clear, and use the verified refund trigger.", {
          requiredInfo: ["Return tracking status", "Warehouse receipt or inspection status when required", "Next owner and follow-up"],
          checklist: [item("tracking_checked", "Return tracking checked"), item("trigger_verified", "Required receipt or inspection trigger verified"), item("followup_set", "Next owner and follow-up recorded")],
          decisions: [decision("return_tracking", "What is the verified return status?", [
            option("label_only", "Label issued; not moving", "Follow up with the customer without implying receipt."),
            option("in_transit", "In transit", "Apply only a refund trigger that explicitly allows this stage."),
            option("warehouse", "Delivered to warehouse", "Confirm any required inspection before action."),
            option("unknown", "Unknown / exception", "Mark pending and escalate as needed."),
          ])],
          guidance: ["Track returns from label issuance and replacements from the new order.", "Use Pending Customer or Pending Warehouse to show the real owner."],
          evidence: ["Carrier scan", "Warehouse receipt or verification when required"],
          warning: "Do not universalize refund timing. The trigger differs by scenario and may require warehouse verification.",
          sources: [sources.returnTracking, sources.refundRequest, sources.orderReturns],
        }),
        step("r-process", "Process refund or replacement", "Complete the approved action only after its route-specific trigger is verified.", {
          requiredInfo: ["Approved resolution", "Verified refund or replacement trigger", "Authorized system result"],
          checklist: [item("trigger_met", "Approved action trigger verified"), item("refund_processed", "I confirmed the refund was processed", { required: false, confirms: "refund_processed", evidence: true }), item("replacement_created", "I confirmed the replacement was created", { required: false, confirms: "replacement_created", evidence: true }), item("escalation_sent", "I confirmed an exception was escalated", { required: false, confirms: "escalation_sent", evidence: true })],
          decisions: [decision("return_action", "What action is being taken?", [
            option("refund", "Process approved refund", "Confirm it separately after the system succeeds."),
            option("replacement", "Create approved replacement", "Confirm it separately after the order succeeds."),
            option("pending", "Keep pending", "Document the unmet trigger and owner."),
            option("escalate", "Escalate", "Document the exception or approval needed."),
          ])],
          guidance: ["A label, carrier scan, or approval is not proof of completed refund or replacement.", "Confirm the action only from the authorized system result."],
          evidence: ["Refund transaction, replacement order, or escalation record"],
          warning: "The final summary will not claim a refund or replacement unless its completion box is checked.",
          sources: [sources.refundRequest, sources.returnTracking, sources.draftOrder],
        }),
        step("r-close", "Update tracker and close case", "Record the full return timeline, confirmed action, current status, and any remaining owner.", {
          requiredInfo: ["Return reason and route", "Tracking and verified trigger", "Confirmed resolution or pending action"],
          checklist: [item("tracker_updated", "Returns/refund tracker updated"), item("notes_saved", "Internal ticket note saved"), item("customer_updated", "Customer update sent"), item("owner_recorded", "Pending owner and next action recorded")],
          guidance: ["Review the generated final summary before copying.", "Choose the status that reflects the real owner; do not mark Resolved while work remains."],
          evidence: ["Tracker entry", "Ticket note", "Customer contact record"],
          warning: "Do not state that a refund, replacement, or return was completed unless the matching action was explicitly confirmed.",
          sources: [sources.returnTracking, sources.refundRequest],
        }),
      ],
    },
  };

  const statusOptions = [
    { value: "in_progress", label: "In Progress" },
    { value: "pending_customer", label: "Pending Customer" },
    { value: "pending_ups", label: "Pending UPS" },
    { value: "pending_warehouse", label: "Pending Warehouse" },
    { value: "escalated", label: "Escalated" },
    { value: "resolved", label: "Resolved" },
    { value: "refunded", label: "Refunded", requires: "refund_processed" },
    { value: "replacement_created", label: "Replacement Created", requires: "replacement_created" },
  ];

  const tabOptions = [
    { value: "agent", label: "Agent Guidance" },
    { value: "email", label: "Email" },
    { value: "chat", label: "Chat" },
    { value: "voice", label: "Voice Call" },
    { value: "notes", label: "Internal Notes" },
  ];

  const defaultState = () => ({
    workflow: "warranty",
    stepByWorkflow: { warranty: 0, shipping: 0, returns: 0 },
    completed: { warranty: [], shipping: [], returns: [] },
    checklists: { warranty: {}, shipping: {}, returns: {} },
    decisions: { warranty: {}, shipping: {}, returns: {} },
    actions: { warranty: {}, shipping: {}, returns: {} },
    status: { warranty: "in_progress", shipping: "in_progress", returns: "in_progress" },
    tab: "agent",
  });

  let state = loadState();
  let root = null;
  let liveMessage = "";
  let initialized = false;

  function loadState() {
    const fallback = defaultState();
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || !workflows[saved.workflow]) return fallback;
      return {
        ...fallback,
        ...saved,
        stepByWorkflow: { ...fallback.stepByWorkflow, ...(saved.stepByWorkflow || {}) },
        completed: { ...fallback.completed, ...(saved.completed || {}) },
        checklists: { ...fallback.checklists, ...(saved.checklists || {}) },
        decisions: { ...fallback.decisions, ...(saved.decisions || {}) },
        actions: { ...fallback.actions, ...(saved.actions || {}) },
        status: { ...fallback.status, ...(saved.status || {}) },
      };
    } catch (_error) {
      return fallback;
    }
  }

  function saveState() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      // The Navigator remains fully usable when storage is unavailable.
    }
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function currentWorkflow() {
    return workflows[state.workflow];
  }

  function currentIndex() {
    const workflow = currentWorkflow();
    return Math.max(0, Math.min(Number(state.stepByWorkflow[workflow.id]) || 0, workflow.steps.length - 1));
  }

  function currentStep() {
    return currentWorkflow().steps[currentIndex()];
  }

  function checkedIds(workflowId, stepId) {
    return state.checklists[workflowId]?.[stepId] || [];
  }

  function checked(workflowId, stepId, itemId) {
    return checkedIds(workflowId, stepId).includes(itemId);
  }

  function decisionValue(workflowId, decisionId) {
    return state.decisions[workflowId]?.[decisionId] || "";
  }

  function selectedOption(workflow, decisionId) {
    const value = decisionValue(workflow.id, decisionId);
    for (const workflowStep of workflow.steps) {
      const definition = workflowStep.decisions.find((entry) => entry.id === decisionId);
      const match = definition?.options.find((entry) => entry.value === value);
      if (match) return match;
    }
    return null;
  }

  function activeBranch(workflow) {
    if (workflow.id === "warranty" && decisionValue(workflow.id, "delivery_damage") === "yes") {
      return workflow.branches.delivery_damage;
    }
    const value = decisionValue(workflow.id, workflow.issueDecision);
    return workflow.branches[value] || null;
  }

  function statusMeta(workflowId) {
    const value = state.status[workflowId] || "in_progress";
    return statusOptions.find((entry) => entry.value === value) || statusOptions[0];
  }

  function canComplete(workflow, workflowStep) {
    const requiredChecks = workflowStep.checklist.filter((entry) => entry.required !== false);
    const checksDone = requiredChecks.every((entry) => checked(workflow.id, workflowStep.id, entry.id));
    const decisionsDone = workflowStep.decisions.filter((entry) => entry.required !== false).every((entry) => decisionValue(workflow.id, entry.id));
    return checksDone && decisionsDone;
  }

  function completionCount(workflow) {
    return workflow.steps.filter((entry) => state.completed[workflow.id]?.includes(entry.id)).length;
  }

  function isActionConfirmed(action) {
    return Boolean(state.actions[currentWorkflow().id]?.[action]);
  }

  function invalidateFrom(index) {
    const workflow = currentWorkflow();
    const affected = new Set(workflow.steps.slice(index).map((entry) => entry.id));
    state.completed[workflow.id] = (state.completed[workflow.id] || []).filter((id) => !affected.has(id));
  }

  function genericCommunication(workflow, workflowStep, channel) {
    const branch = activeBranch(workflow);
    const issue = branch?.label || "the reported concern";
    const status = statusMeta(workflow.id).label;
    const processName = workflow.name;
    if (channel === "email") {
      return `Hi [Customer Name],\n\nThank you for your patience while we review ${issue.toLowerCase()}. We are currently completing: ${workflowStep.title}.\n\nCurrent status: ${status}.\nNext step: [VERIFIED NEXT ACTION].\n\nWe will update you when the next action is confirmed.\n\nThank you,`;
    }
    if (channel === "chat") {
      return `Thank you for your patience. I’m reviewing ${issue.toLowerCase()} and completing “${workflowStep.title}.” The current status is ${status}. I’ll share the next verified action once it is confirmed.`;
    }
    if (channel === "voice") {
      return `VOICE GUIDE — ${processName}\n• Acknowledge: “I understand you’re contacting us about ${issue.toLowerCase()}.”\n• Explain: “I’m completing ${workflowStep.title.toLowerCase()} so I can give you the correct next step.”\n• Confirm: [ASK ONLY FOR INFORMATION REQUIRED IN THIS STEP]\n• Set expectation: “I’ll explain the next verified action before we finish.”`;
    }
    return `PROCESS: ${processName}\nISSUE: ${issue}\nCURRENT STEP: ${workflowStep.title}\nVERIFIED INFORMATION: [ADD TO AUTHORIZED TICKET]\nACTION TAKEN: [CONFIRMED ACTION ONLY]\nCURRENT STATUS: ${status}\nPENDING ACTION / OWNER: [ADD]\nSOURCE CHECKED: ${workflowStep.sources.map((entry) => entry.title).join("; ")}`;
  }

  function communication(workflow, workflowStep, channel) {
    return workflowStep.communication[channel] || genericCommunication(workflow, workflowStep, channel);
  }

  function actionSummary(workflowId) {
    const actions = state.actions[workflowId] || {};
    const confirmed = [];
    if (actions.claim_filed) confirmed.push("UPS claim filed");
    if (actions.return_label_created) confirmed.push("Return label created and sent");
    if (actions.refund_processed) confirmed.push("Refund processed");
    if (actions.replacement_created) confirmed.push("Replacement created");
    if (actions.escalation_sent) confirmed.push("Escalation sent");
    return confirmed.length ? confirmed.join("; ") : "No completion action confirmed";
  }

  function evidenceSummary(workflow) {
    const labels = workflow.steps.flatMap((workflowStep) =>
      workflowStep.checklist
        .filter((entry) => entry.evidence && checked(workflow.id, workflowStep.id, entry.id))
        .map((entry) => entry.label.replace(/^I confirmed /, "")),
    );
    return labels.length ? labels.join("; ") : "No evidence receipt confirmed in Navigator";
  }

  function verifiedSummary(workflow) {
    const labels = workflow.steps.flatMap((workflowStep) =>
      workflowStep.checklist
        .filter((entry) => !entry.evidence && checked(workflow.id, workflowStep.id, entry.id))
        .map((entry) => entry.label),
    );
    return labels.length ? labels.slice(0, 8).join("; ") : "No verification checklist completed";
  }

  function pendingSummary(workflow) {
    const status = statusMeta(workflow.id).value;
    const map = {
      pending_customer: "Awaiting customer information or evidence",
      pending_ups: "Awaiting UPS review or update",
      pending_warehouse: "Awaiting warehouse receipt or verification",
      escalated: "Awaiting escalation decision",
      resolved: "No pending action selected",
      refunded: "Confirm customer communication and case closure",
      replacement_created: "Monitor replacement tracking and customer update",
      in_progress: `Complete ${workflow.steps[currentIndex()].title}`,
    };
    return map[status] || "Confirm the next owner and action";
  }

  function escalationSummary(workflow) {
    const answers = state.decisions[workflow.id] || {};
    const needsEscalation = statusMeta(workflow.id).value === "escalated"
      || Boolean(state.actions[workflow.id]?.escalation_sent)
      || Object.values(answers).some((value) => value === "unclear" || value === "escalate" || value === "not_safe");
    return needsEscalation ? "Yes — confirm owner and question in the ticket" : "Not selected; reassess if an exception remains";
  }

  function summaryData(workflow) {
    const issue = selectedOption(workflow, workflow.issueDecision)?.label || "Not selected";
    const requested = selectedOption(workflow, workflow.requestDecision)?.label || "Not selected";
    const troubleshoot = workflow.id === "warranty"
      ? selectedOption(workflow, "troubleshooting_result")?.label || "Not completed"
      : "Not applicable to this process unless branch guidance required it";
    return {
      process: workflow.name,
      issue,
      verified: verifiedSummary(workflow),
      troubleshooting: troubleshoot,
      evidence: evidenceSummary(workflow),
      action: actionSummary(workflow.id),
      status: statusMeta(workflow.id).label,
      pending: pendingSummary(workflow),
      escalation: escalationSummary(workflow),
      requested,
    };
  }

  function internalSummary(workflow) {
    const summary = summaryData(workflow);
    return `GUIDED PROCESS SUMMARY\nProcess selected: ${summary.process}\nIssue: ${summary.issue}\nInformation verified: ${summary.verified}\nTroubleshooting completed: ${summary.troubleshooting}\nEvidence received: ${summary.evidence}\nAction taken: ${summary.action}\nCurrent status: ${summary.status}\nPending action: ${summary.pending}\nEscalation required: ${summary.escalation}\nCustomer requested resolution: ${summary.requested}\n\nReview all fields against the authorized ticket before saving.`;
  }

  function customerSummary(workflow, channel) {
    const summary = summaryData(workflow);
    const confirmedAction = summary.action === "No completion action confirmed"
      ? "No refund, replacement, carrier claim, or shipment completion has been confirmed yet."
      : `Confirmed action: ${summary.action}.`;
    if (channel === "chat") {
      return `Thank you for your patience. We reviewed your ${summary.issue.toLowerCase()} request. Current status: ${summary.status}. ${confirmedAction} Next step: ${summary.pending}.`;
    }
    if (channel === "voice") {
      return `VOICE-CALL NOTES\nProcess: ${summary.process}\nIssue: ${summary.issue}\nCustomer requested: ${summary.requested}\nVerified status: ${summary.status}\nConfirmed action: ${summary.action}\nPending action: ${summary.pending}\nCustomer was not promised an unconfirmed refund, replacement, claim, or shipment.`;
    }
    return `Hi [Customer Name],\n\nThank you for your patience while we reviewed your ${summary.issue.toLowerCase()} request.\n\nCurrent status: ${summary.status}.\n${confirmedAction}\nNext step: ${summary.pending}.\n\nWe will share another update when the next action is verified.\n\nThank you,`;
  }

  function renderWorkflowSelector(workflow) {
    return `<div class="guided-process-selector" role="group" aria-label="Choose a support process">
      ${Object.values(workflows).map((entry) => `
        <button type="button" class="guided-process-choice${entry.id === workflow.id ? " is-active" : ""}" data-guided-workflow="${entry.id}" aria-pressed="${entry.id === workflow.id}">
          <span class="guided-process-choice-icon" aria-hidden="true">${escapeHtml(entry.icon)}</span>
          <span><strong>${escapeHtml(entry.navName)}</strong><small>${escapeHtml(entry.name)}</small></span>
        </button>`).join("")}
    </div>`;
  }

  function renderLocationBreadcrumb(workflow, workflowStep) {
    return `<nav class="guided-location" aria-label="Location breadcrumb">
      <button type="button" data-view="hub">Home</button><span aria-hidden="true">›</span>
      <span>Processes</span><span aria-hidden="true">›</span>
      <span>${escapeHtml(workflow.navName)}</span><span aria-hidden="true">›</span>
      <strong aria-current="page">${escapeHtml(workflowStep.title)}</strong>
    </nav>`;
  }

  function renderStatusControl(workflow) {
    const status = statusMeta(workflow.id);
    return `<div class="guided-status-control">
      <label for="guidedStatus"><span>Case status</span>
        <select id="guidedStatus" data-guided-status>
          ${statusOptions.map((entry) => {
            const blocked = entry.requires && !state.actions[workflow.id]?.[entry.requires];
            return `<option value="${entry.value}"${status.value === entry.value ? " selected" : ""}${blocked ? " disabled" : ""}>${escapeHtml(entry.label)}${blocked ? " — confirm action first" : ""}</option>`;
          }).join("")}
        </select>
      </label>
      <span class="guided-status-badge status-${escapeHtml(status.value)}"><span aria-hidden="true">●</span>${escapeHtml(status.label)}</span>
    </div>`;
  }

  function renderProgress(workflow) {
    const completed = completionCount(workflow);
    const percent = Math.round((completed / workflow.steps.length) * 100);
    return `<section class="guided-progress" aria-label="Process progress">
      <div><span>Step ${currentIndex() + 1} of ${workflow.steps.length}</span><strong>${percent}% complete</strong></div>
      <div class="guided-progress-track" role="progressbar" aria-label="${escapeHtml(workflow.name)} completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
        <span style="width:${percent}%"></span>
      </div>
    </section>`;
  }

  function stepState(workflow, workflowStep, index) {
    if (state.completed[workflow.id]?.includes(workflowStep.id)) return "completed";
    if (index === currentIndex()) return "current";
    return "upcoming";
  }

  function renderStepButton(workflow, workflowStep, index, mobile = false) {
    const progressState = stepState(workflow, workflowStep, index);
    const clickable = progressState === "completed" || progressState === "current";
    const label = progressState === "completed" ? "Completed" : progressState === "current" ? "Current" : "Upcoming";
    return `<li class="guided-step-item is-${progressState}">
      <button type="button" data-guided-step="${index}"${clickable ? "" : " disabled"}${progressState === "current" ? ' aria-current="step"' : ""}>
        <span class="guided-step-marker" aria-hidden="true">${progressState === "completed" ? "✓" : index + 1}</span>
        <span class="guided-step-copy"><strong>${escapeHtml(workflowStep.title)}</strong><small>${label}</small></span>
      </button>
    </li>`;
  }

  function renderStepNavigation(workflow) {
    const buttons = workflow.steps.map((entry, index) => renderStepButton(workflow, entry, index)).join("");
    return `<aside class="guided-step-rail" aria-label="Workflow steps">
      <div class="guided-step-rail-head"><span>Process map</span><small>Completed steps stay available</small></div>
      <ol>${buttons}</ol>
    </aside>
    <details class="guided-mobile-steps">
      <summary><span>All ${workflow.steps.length} steps</span><strong>Step ${currentIndex() + 1}: ${escapeHtml(currentStep().title)}</strong></summary>
      <ol>${buttons}</ol>
    </details>`;
  }

  function renderChecklist(workflow, workflowStep) {
    if (!workflowStep.checklist.length) return "";
    return `<section class="guided-block guided-checklist-block">
      <div class="guided-block-heading"><div><span class="guided-block-icon" aria-hidden="true">✓</span><h4>Checklist</h4></div><small>Required items are marked</small></div>
      <div class="guided-checklist">
        ${workflowStep.checklist.map((entry) => `<label class="guided-check${checked(workflow.id, workflowStep.id, entry.id) ? " is-checked" : ""}">
          <input type="checkbox" data-guided-check="${escapeHtml(entry.id)}"${checked(workflow.id, workflowStep.id, entry.id) ? " checked" : ""} />
          <span><strong>${escapeHtml(entry.label)}</strong>${entry.required === false ? "<small>Optional confirmation</small>" : "<small>Required</small>"}</span>
        </label>`).join("")}
      </div>
    </section>`;
  }

  function renderDecisions(workflow, workflowStep) {
    if (!workflowStep.decisions.length) return "";
    return workflowStep.decisions.map((entry) => `<fieldset class="guided-block guided-decision">
      <legend><span class="guided-block-icon" aria-hidden="true">?</span>${escapeHtml(entry.prompt)}</legend>
      <p>${escapeHtml(entry.help)}</p>
      <div class="guided-decision-grid">
        ${entry.options.map((choice) => {
          const selected = decisionValue(workflow.id, entry.id) === choice.value;
          return `<label class="guided-decision-card${selected ? " is-selected" : ""}">
            <input type="radio" name="guided-${escapeHtml(entry.id)}" value="${escapeHtml(choice.value)}" data-guided-decision="${escapeHtml(entry.id)}"${selected ? " checked" : ""} />
            <span class="guided-radio-dot" aria-hidden="true"></span>
            <span><strong>${escapeHtml(choice.label)}</strong><small>${escapeHtml(choice.detail)}</small></span>
          </label>`;
        }).join("")}
      </div>
    </fieldset>`).join("");
  }

  function renderContext(workflow, workflowStep) {
    const branch = activeBranch(workflow);
    const branchNote = branch?.notes?.[workflowStep.id];
    const ruleNotes = (workflow.contextRules || []).filter((rule) => currentIndex() >= rule.from && decisionValue(workflow.id, rule.decision) === rule.value);
    if (!branch && !ruleNotes.length) return "";
    return `<section class="guided-context" aria-label="Selected path guidance">
      ${branch ? `<div class="guided-route"><span>Active path</span><strong>${escapeHtml(branch.route)}</strong><small>${escapeHtml(branch.label)}</small></div>` : ""}
      ${branchNote ? `<div class="guided-context-note"><strong>Path guidance</strong><p>${escapeHtml(branchNote)}</p></div>` : ""}
      ${ruleNotes.map((rule) => `<div class="guided-context-note is-warning"><strong>${escapeHtml(rule.title)}</strong><p>${escapeHtml(rule.text)}</p></div>`).join("")}
    </section>`;
  }

  function renderListBlock(title, icon, entries, className = "") {
    if (!entries?.length) return "";
    return `<section class="guided-block ${className}">
      <div class="guided-block-heading"><div><span class="guided-block-icon" aria-hidden="true">${icon}</span><h4>${escapeHtml(title)}</h4></div></div>
      <ul>${entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
    </section>`;
  }

  function renderSources(workflowStep) {
    return `<section class="guided-sources">
      <div><span class="guided-block-icon" aria-hidden="true">↗</span><h4>Verified KB sources</h4></div>
      <ul>${workflowStep.sources.map((entry) => `<li><a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.title)}</a><span>${escapeHtml(entry.date)}</span></li>`).join("")}</ul>
    </section>`;
  }

  function renderCommunication(workflow, workflowStep) {
    const activeTab = tabOptions.some((entry) => entry.value === state.tab) ? state.tab : "agent";
    const isAgent = activeTab === "agent";
    const content = isAgent ? workflowStep.guidance : communication(workflow, workflowStep, activeTab);
    return `<section class="guided-comms">
      <div class="guided-comms-heading">
        <div><span>Channel-safe content</span><h4>${isAgent ? "Agent Guidance" : activeTab === "notes" ? "Internal Notes" : "Customer-Ready Response"}</h4></div>
        ${isAgent ? "" : `<button type="button" class="guided-copy-button" data-guided-copy="step-${activeTab}"><span aria-hidden="true">⧉</span> Copy ${activeTab === "notes" ? "notes" : activeTab}</button>`}
      </div>
      <div class="guided-tabs" role="tablist" aria-label="Response channel">
        ${tabOptions.map((entry) => `<button type="button" role="tab" id="guided-tab-${entry.value}" aria-controls="guided-tabpanel" aria-selected="${entry.value === activeTab}" tabindex="${entry.value === activeTab ? "0" : "-1"}" data-guided-tab="${entry.value}">${escapeHtml(entry.label)}</button>`).join("")}
      </div>
      <div id="guided-tabpanel" class="guided-tab-panel" role="tabpanel" aria-labelledby="guided-tab-${activeTab}">
        ${isAgent ? `<ul>${workflowStep.guidance.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>` : `<pre>${escapeHtml(content)}</pre>`}
      </div>
      <p class="guided-privacy-note"><span aria-hidden="true">◉</span> Customer details belong only in the authorized ticket or communication tool. This Navigator stores no personal data.</p>
    </section>`;
  }

  function renderSummary(workflow) {
    if (currentIndex() !== workflow.steps.length - 1) return "";
    const summary = summaryData(workflow);
    const rows = [
      ["Process selected", summary.process], ["Issue", summary.issue], ["Information verified", summary.verified],
      ["Troubleshooting completed", summary.troubleshooting], ["Evidence received", summary.evidence], ["Action taken", summary.action],
      ["Current status", summary.status], ["Pending action", summary.pending], ["Escalation required", summary.escalation],
      ["Customer requested resolution", summary.requested],
    ];
    return `<section class="guided-final-summary" aria-labelledby="guidedSummaryTitle">
      <div class="guided-summary-heading"><div><span>Final checkpoint</span><h3 id="guidedSummaryTitle">Case summary</h3><p>Generated only from generic selections and explicit confirmations. Review against the ticket before copying.</p></div><span class="guided-summary-shield">No PII stored</span></div>
      <dl>${rows.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
      <div class="guided-summary-actions" aria-label="Copy case summary">
        <button type="button" data-guided-copy="summary-notes"><span aria-hidden="true">⧉</span> Internal ticket notes</button>
        <button type="button" data-guided-copy="summary-email"><span aria-hidden="true">⧉</span> Customer email</button>
        <button type="button" data-guided-copy="summary-chat"><span aria-hidden="true">⧉</span> Chat response</button>
        <button type="button" data-guided-copy="summary-voice"><span aria-hidden="true">⧉</span> Voice-call notes</button>
      </div>
    </section>`;
  }

  function renderActivePanel(workflow, workflowStep) {
    const ready = canComplete(workflow, workflowStep);
    return `<article class="guided-active-panel" aria-labelledby="guidedStepTitle">
      <header class="guided-active-head">
        <div><span class="guided-step-eyebrow">Step ${currentIndex() + 1} of ${workflow.steps.length}</span><h3 id="guidedStepTitle" tabindex="-1">${escapeHtml(workflowStep.title)}</h3><p>${escapeHtml(workflowStep.purpose)}</p></div>
        <span class="guided-readiness${ready ? " is-ready" : ""}">${ready ? "Ready for next step" : "Complete required items"}</span>
      </header>
      <details class="guided-why"><summary>Why this step?</summary><p>${escapeHtml(workflowStep.why)}</p></details>
      ${renderContext(workflow, workflowStep)}
      <div class="guided-detail-grid">
        ${renderListBlock("Required information", "i", workflowStep.requiredInfo)}
        ${renderListBlock("Required evidence", "▣", workflowStep.evidence)}
      </div>
      ${renderChecklist(workflow, workflowStep)}
      ${renderDecisions(workflow, workflowStep)}
      <aside class="guided-policy-warning" role="note"><span aria-hidden="true">!</span><div><strong>Policy / exception check</strong><p>${escapeHtml(workflowStep.warning)}</p></div></aside>
      ${renderSources(workflowStep)}
      ${renderCommunication(workflow, workflowStep)}
      ${renderSummary(workflow)}
      <div id="guidedValidation" class="guided-validation" role="alert">${escapeHtml(liveMessage)}</div>
      <footer class="guided-controls">
        <button type="button" class="guided-back" data-guided-back${currentIndex() === 0 ? " disabled" : ""}><span aria-hidden="true">←</span> Back</button>
        <span>Progress is saved for this browser session only.</span>
        <button type="button" class="guided-next" data-guided-next${ready ? "" : " disabled"}>${currentIndex() === workflow.steps.length - 1 ? "Complete step" : "Next step"} <span aria-hidden="true">→</span></button>
      </footer>
    </article>`;
  }

  function render() {
    root = document.querySelector("#guidedProcessApp");
    if (!root) return;
    const workflow = currentWorkflow();
    state.stepByWorkflow[workflow.id] = currentIndex();
    const workflowStep = currentStep();
    const completed = completionCount(workflow);
    root.innerHTML = `
      <section class="guided-process-shell">
        <div class="guided-process-topbar">
          <div><span class="guided-process-kicker">Guided Process Navigator</span><h2>${escapeHtml(workflow.name)}</h2><p>${escapeHtml(workflow.description)}</p></div>
          <button type="button" class="guided-restart" data-guided-restart><span aria-hidden="true">↻</span> Restart process</button>
        </div>
        ${renderWorkflowSelector(workflow)}
        <div class="guided-process-meta">${renderLocationBreadcrumb(workflow, workflowStep)}${renderStatusControl(workflow)}</div>
        ${renderProgress(workflow)}
        <div class="guided-workspace">
          ${renderStepNavigation(workflow)}
          ${renderActivePanel(workflow, workflowStep)}
        </div>
        <p class="guided-live" aria-live="polite">${escapeHtml(liveMessage || `${completed} of ${workflow.steps.length} steps completed`)}</p>
      </section>`;
  }

  function announce(message) {
    liveMessage = message;
  }

  function navigateTo(index, focus = true) {
    const workflow = currentWorkflow();
    state.stepByWorkflow[workflow.id] = Math.max(0, Math.min(index, workflow.steps.length - 1));
    saveState();
    render();
    if (focus) window.requestAnimationFrame(() => document.querySelector("#guidedStepTitle")?.focus());
  }

  function showValidation(message) {
    announce(message);
    render();
    window.requestAnimationFrame(() => document.querySelector("#guidedValidation")?.focus?.());
  }

  function copyText(text, label, button) {
    const finish = () => {
      const original = button?.textContent;
      if (button) {
        button.textContent = "Copied";
        window.setTimeout(() => { button.textContent = original; }, 1400);
      }
      if (typeof window.showToast === "function") window.showToast(label);
      announce(label);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
    } else {
      fallbackCopy(text, finish);
    }
  }

  function fallbackCopy(text, finish) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    finish();
  }

  function copyPayload(type) {
    const workflow = currentWorkflow();
    const workflowStep = currentStep();
    const map = {
      "step-email": () => communication(workflow, workflowStep, "email"),
      "step-chat": () => communication(workflow, workflowStep, "chat"),
      "step-voice": () => communication(workflow, workflowStep, "voice"),
      "step-notes": () => communication(workflow, workflowStep, "notes"),
      "summary-notes": () => internalSummary(workflow),
      "summary-email": () => customerSummary(workflow, "email"),
      "summary-chat": () => customerSummary(workflow, "chat"),
      "summary-voice": () => customerSummary(workflow, "voice"),
    };
    return map[type]?.() || "";
  }

  function handleClick(event) {
    const workflowButton = event.target.closest("[data-guided-workflow]");
    if (workflowButton) {
      state.workflow = workflowButton.dataset.guidedWorkflow;
      announce(`${currentWorkflow().name} selected`);
      saveState();
      render();
      window.requestAnimationFrame(() => document.querySelector("#guidedStepTitle")?.focus());
      return;
    }

    const stepButton = event.target.closest("[data-guided-step]");
    if (stepButton && !stepButton.disabled) {
      navigateTo(Number(stepButton.dataset.guidedStep));
      return;
    }

    if (event.target.closest("[data-guided-back]")) {
      navigateTo(currentIndex() - 1);
      return;
    }

    if (event.target.closest("[data-guided-next]")) {
      const workflow = currentWorkflow();
      const workflowStep = currentStep();
      if (!canComplete(workflow, workflowStep)) {
        showValidation("Complete every required checklist item and decision before continuing.");
        return;
      }
      if (!state.completed[workflow.id].includes(workflowStep.id)) state.completed[workflow.id].push(workflowStep.id);
      announce(`${workflowStep.title} completed`);
      saveState();
      if (currentIndex() < workflow.steps.length - 1) navigateTo(currentIndex() + 1);
      else render();
      return;
    }

    const tab = event.target.closest("[data-guided-tab]");
    if (tab) {
      state.tab = tab.dataset.guidedTab;
      saveState();
      render();
      window.requestAnimationFrame(() => document.querySelector(`#guided-tab-${state.tab}`)?.focus());
      return;
    }

    const copy = event.target.closest("[data-guided-copy]");
    if (copy) {
      copyText(copyPayload(copy.dataset.guidedCopy), "Guided process text copied", copy);
      return;
    }

    if (event.target.closest("[data-guided-restart]")) {
      const workflow = currentWorkflow();
      const approved = window.confirm(`Restart ${workflow.name}? This clears only its generic checklist, decisions, status, and progress. No customer data is stored here.`);
      if (!approved) return;
      const fresh = defaultState();
      state.stepByWorkflow[workflow.id] = 0;
      state.completed[workflow.id] = [];
      state.checklists[workflow.id] = {};
      state.decisions[workflow.id] = {};
      state.actions[workflow.id] = {};
      state.status[workflow.id] = fresh.status[workflow.id];
      announce(`${workflow.name} restarted`);
      saveState();
      render();
      window.requestAnimationFrame(() => document.querySelector("#guidedStepTitle")?.focus());
    }
  }

  function handleChange(event) {
    const workflow = currentWorkflow();
    const workflowStep = currentStep();
    const check = event.target.closest("[data-guided-check]");
    if (check) {
      const id = check.dataset.guidedCheck;
      const list = new Set(checkedIds(workflow.id, workflowStep.id));
      if (check.checked) list.add(id); else list.delete(id);
      state.checklists[workflow.id][workflowStep.id] = [...list];
      const definition = workflowStep.checklist.find((entry) => entry.id === id);
      if (definition?.confirms) state.actions[workflow.id][definition.confirms] = check.checked;
      if (!check.checked && definition?.required !== false) invalidateFrom(currentIndex());
      const currentStatus = statusOptions.find((entry) => entry.value === state.status[workflow.id]);
      if (currentStatus?.requires && !state.actions[workflow.id][currentStatus.requires]) state.status[workflow.id] = "in_progress";
      announce(check.checked ? `${definition?.label || "Item"} checked` : `${definition?.label || "Item"} unchecked`);
      saveState();
      render();
      return;
    }

    const answer = event.target.closest("[data-guided-decision]");
    if (answer) {
      state.decisions[workflow.id][answer.dataset.guidedDecision] = answer.value;
      invalidateFrom(currentIndex());
      announce("Decision saved; following guidance updated");
      saveState();
      render();
      return;
    }

    const status = event.target.closest("[data-guided-status]");
    if (status) {
      const selected = statusOptions.find((entry) => entry.value === status.value);
      if (selected?.requires && !state.actions[workflow.id][selected.requires]) {
        announce(`Confirm ${selected.label.toLowerCase()} in the action step first`);
        state.status[workflow.id] = "in_progress";
      } else {
        state.status[workflow.id] = status.value;
        announce(`Status changed to ${selected?.label || status.value}`);
      }
      saveState();
      render();
    }
  }

  function handleKeydown(event) {
    const tab = event.target.closest("[role='tab'][data-guided-tab]");
    if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = tabOptions.findIndex((entry) => entry.value === tab.dataset.guidedTab);
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabOptions.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabOptions.length) % tabOptions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabOptions.length - 1;
    state.tab = tabOptions[nextIndex].value;
    saveState();
    render();
    window.requestAnimationFrame(() => document.querySelector(`#guided-tab-${state.tab}`)?.focus());
  }

  function init() {
    if (initialized) return;
    root = document.querySelector("#guidedProcessApp");
    if (!root) return;
    root.addEventListener("click", handleClick);
    root.addEventListener("change", handleChange);
    root.addEventListener("keydown", handleKeydown);
    initialized = true;
  }

  window.GuidedProcessNavigator = {
    render() {
      init();
      render();
    },
    workflows,
    getState: () => JSON.parse(JSON.stringify(state)),
  };
})();

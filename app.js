const data = window.KB_DATA;
const medifyManuals = window.MEDIFY_MANUALS || { manuals: [], warrantySummary: [] };
const internalKb = window.INTERNAL_KB || { pages: [] };
const supportLibrary = window.SUPPORT_LIBRARY || { tickets: [], cannedResponses: [] };
const faqLibrary = window.CJEI_FAQS || [];
const focusMusic = window.FOCUS_MUSIC || { defaultVolume: 0.15, playlist: [] };
const state = {
  view: "hub",
  query: "",
  sheet: "All sheets",
  section: "All sections",
  kbCategory: "All",
  kbQuery: "",
  kbTag: "All tags",
  toolFocus: "",
  cannedQuery: "",
  cannedCategory: "All categories",
  cannedModel: "All models",
  ticketQuery: "",
  ticketCategory: "All categories",
  ticketIssue: "All issue types",
  ticketModel: "All models",
  ticketStatus: "All statuses",
  ticketTag: "All tags",
  ticketLinkQuery: "",
  faqQuery: "",
  faqCategory: "All categories",
  musicIndex: Number(localStorage.getItem("wagmiMusicIndex") || 0),
  musicMuted: localStorage.getItem("wagmiMusicMuted") === "true",
  musicVolume: Number(localStorage.getItem("wagmiMusicVolume") || focusMusic.defaultVolume || 0.15),
  saved: new Set(JSON.parse(localStorage.getItem("wagmiSavedScripts") || localStorage.getItem("zichSavedScripts") || "[]")),
};

const els = {
  sourceName: document.querySelector("#sourceName"),
  searchInput: document.querySelector("#searchInput"),
  sheetFilter: document.querySelector("#sheetFilter"),
  sectionFilter: document.querySelector("#sectionFilter"),
  hubResults: document.querySelector("#hubResults"),
  hubCount: document.querySelector("#hubCount"),
  kbCount: document.querySelector("#kbCount"),
  internalKbList: document.querySelector("#internalKbList"),
  internalKbCount: document.querySelector("#internalKbCount"),
  kbSearch: document.querySelector("#kbSearch"),
  kbCategorySelect: document.querySelector("#kbCategorySelect"),
  kbTagSelect: document.querySelector("#kbTagSelect"),
  kbChips: document.querySelector("#kbChips"),
  clearKbFilters: document.querySelector("#clearKbFilters"),
  cards: document.querySelector("#cards"),
  favoritesList: document.querySelector("#favoritesList"),
  resultCount: document.querySelector("#resultCount"),
  cannedSearch: document.querySelector("#cannedSearch"),
  cannedCategory: document.querySelector("#cannedCategory"),
  cannedModel: document.querySelector("#cannedModel"),
  cannedChips: document.querySelector("#cannedChips"),
  clearCannedFilters: document.querySelector("#clearCannedFilters"),
  ticketLibraryCount: document.querySelector("#ticketLibraryCount"),
  ticketLibrarySearch: document.querySelector("#ticketLibrarySearch"),
  ticketLibraryCategory: document.querySelector("#ticketLibraryCategory"),
  ticketLibraryIssue: document.querySelector("#ticketLibraryIssue"),
  ticketLibraryModel: document.querySelector("#ticketLibraryModel"),
  ticketLibraryStatus: document.querySelector("#ticketLibraryStatus"),
  ticketLibraryTag: document.querySelector("#ticketLibraryTag"),
  ticketLibraryChips: document.querySelector("#ticketLibraryChips"),
  ticketLibraryResults: document.querySelector("#ticketLibraryResults"),
  ticketNoteTemplateGrid: document.querySelector("#ticketNoteTemplateGrid"),
  ticketNoteTemplateCount: document.querySelector("#ticketNoteTemplateCount"),
  clearTicketFilters: document.querySelector("#clearTicketFilters"),
  ticketLinkCount: document.querySelector("#ticketLinkCount"),
  ticketLinkSearch: document.querySelector("#ticketLinkSearch"),
  clearTicketLinkSearch: document.querySelector("#clearTicketLinkSearch"),
  ticketLinkResults: document.querySelector("#ticketLinkResults"),
  detailDrawer: document.querySelector("#detailDrawer"),
  ticketDrawerBackdrop: document.querySelector("#ticketDrawerBackdrop"),
  detailDrawerContent: document.querySelector("#detailDrawerContent"),
  closeDetailDrawer: document.querySelector("#closeDetailDrawer"),
  manualsCount: document.querySelector("#manualsCount"),
  manualSearch: document.querySelector("#manualSearch"),
  warrantySummary: document.querySelector("#warrantySummary"),
  manualCards: document.querySelector("#manualCards"),
  faqCount: document.querySelector("#faqCount"),
  faqSearch: document.querySelector("#faqSearch"),
  faqCategory: document.querySelector("#faqCategory"),
  faqChips: document.querySelector("#faqChips"),
  faqList: document.querySelector("#faqList"),
  clearFaqFilters: document.querySelector("#clearFaqFilters"),
  toolsCount: document.querySelector("#toolsCount"),
  replacementReason: document.querySelector("#replacementReason"),
  replacementOrder: document.querySelector("#replacementOrder"),
  generatedCode: document.querySelector("#generatedCode"),
  copyGenerated: document.querySelector("#copyGenerated"),
  formulaNote: document.querySelector("#formulaNote"),
  unitSelect: document.querySelector("#unitSelect"),
  unitSearch: document.querySelector("#unitSearch"),
  unitDetails: document.querySelector("#unitDetails"),
  purifierCompareOne: document.querySelector("#purifierCompareOne"),
  purifierCompareTwo: document.querySelector("#purifierCompareTwo"),
  purifierCompareThree: document.querySelector("#purifierCompareThree"),
  purifierComparisonTable: document.querySelector("#purifierComparisonTable"),
  musicTitle: document.querySelector("#musicTitle"),
  musicMeta: document.querySelector("#musicMeta"),
  musicPrev: document.querySelector("#musicPrev"),
  musicPlay: document.querySelector("#musicPlay"),
  musicNext: document.querySelector("#musicNext"),
  musicMute: document.querySelector("#musicMute"),
  musicVolume: document.querySelector("#musicVolume"),
  toast: document.querySelector("#toast"),
};

const ticketKeywords = ["delivery", "address", "LED", "warranty", "replacement", "refund", "cancel", "filter", "Amazon"];
const cannedKeywords = ["refund", "warranty", "subscription", "shipping", "return", "replacement", "filter", "delivery"];
const ticketLibraryKeywords = ["delivered", "address", "refund", "unsafe link", "replacement", "subscription", "warranty", "MA-25"];
const ticketNoteTemplates = [
  {
    id: "ticket-note-warranty-replacement",
    title: "Warranty Replacement",
    description: "Use when documenting why a purifier or part is being replaced.",
    tags: ["replacement", "warranty", "order number", "reason for replacement"],
    text: `Order number:
Order date:
SKU:
Issue: [Reason for replacement]`,
  },
  {
    id: "ticket-note-general-email",
    title: "General Email Note",
    description: "Quick internal note for a standard email interaction.",
    tags: ["email", "order", "issue", "general note"],
    text: `Order number:
Order date:
SKU:
Issue:
JA`,
  },
  {
    id: "ticket-note-voice-call",
    title: "Voice Call Note",
    description: "Complete call documentation using your latest voice-note format.",
    tags: ["voice", "call", "Aircall", "action taken"],
    text: `Spoke With:
Name on the Account:
Order Num:
Email Address:
Contact #:
Reason for Calling:
ACTION TAKEN:
Offered FC/Cross Sell:
AC Call ID:
JA`,
  },
  {
    id: "ticket-note-cancellation-request",
    title: "Cancellation Request",
    description: "Use for an order-cancellation escalation or request.",
    tags: ["cancel", "cancellation", "order", "ticket link"],
    text: `*CANCELLATION REQUEST*
Order Number:
SKU:
Order Cancellation Reason:
Initials:
TICKET LINK:`,
  },
  {
    id: "ticket-note-hold-request",
    title: "Hold Request",
    description: "Use when asking the team to place an order on hold.",
    tags: ["hold", "order", "request", "ticket link"],
    text: `*HOLD REQUEST*
Customer Name:
Order Number:
SKU:
Reason:
Initials:
TICKET LINK:`,
  },
  {
    id: "ticket-note-return-request",
    title: "Return Request",
    description: "Document the order, return reason, condition, and supporting photos.",
    tags: ["return", "refund", "photos", "return label"],
    text: `*RETURN REQUEST*
Order Number:
Order Date:
Delivery Date:
SKU:
Reason for Return:
Product/Packaging Condition:
Photos Received:
Return Label Sent:
TICKET LINK:
JA`,
  },
  {
    id: "ticket-note-escalation",
    title: "Order / Warranty Escalation",
    description: "Detailed handoff template for order, return, or warranty assistance.",
    tags: ["escalation", "warranty", "Shopify", "customer details"],
    text: `Customer Name/Company Name:
(Draft) Order#:
SKU:
Contact No:
Email Address:
Address:
Details/Reason:
EFF/Shopify Status:
Warranty Registered?
TICKET LINK:`,
  },
];
const kbKeywords = ["warranty", "troubleshooting", "Recharge", "missing package", "refund", "replacement", "MA-40", "UV"];
const completedCopies = new Set(JSON.parse(localStorage.getItem("cjeiCompletedCopies") || "[]"));
const audio = new Audio();
const purifierSourceUrl = "https://medifyair.com/collections/air-purifiers";
const purifierCompareDefaults = ["ma-25", "ma-40", "ma-50-v3"];
const purifierProducts = [
  {
    id: "ma-14",
    name: "MA-14 Air Purifier",
    url: "https://medifyair.com/products/ma-14",
    coverage: "213 sq ft in 30 minutes",
    bestFor: "Small rooms; bedrooms, nurseries, and offices",
    filter: "True HEPA H13",
    verification: "AHAM Verified",
    price: "$88.99",
    availability: "Available",
    variants: "White or Black; Single or Two-Pack",
    features: "3 fan speeds, sleep mode, UV light, filter indicator, touch controls",
    dimensions: '12.20" H x 8.26" W x 8.26" D',
    weight: "7 lbs",
    wattage: "16W",
    controls: "3 Fan Speeds, Touch Controls, Sleep Mode, Standby Mode, Filter Indicator",
    fanSpeeds: "3 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 428 sq ft (1 ACH); 30 min: 213 sq ft (2 ACH); 15 min: 107 sq ft (4 ACH); 12 min: 85.5 sq ft (5 ACH)",
    cadrBySpeed: "Not listed",
    cadrByParticle: "Smoke: 57 CFM (97 m³/h); Dust: 60 CFM (102 m³/h); Pollen: 77 CFM (131 m³/h); PM2.5: 59 CFM (100 m³/h)",
    ief: "2.4",
    annualEnergy: "144 kWh/year",
    ahamVerifiedAt: "89 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "2,500 hours (3-4 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Sleep: 26 dBA; Speed 1: 29.5 dBA; Speed 2: 37.2 dBA; Speed 3: 48.3 dBA",
    onWheels: "No",
  },
  {
    id: "ma-15",
    name: "MA-15 Air Purifier (Legacy / Discontinued)",
    url: "https://medifyair.com/products/ma-15",
    coverage: "293 sq ft in 30 minutes",
    bestFor: "Bedrooms, nurseries, and offices",
    filter: "True HEPA H13",
    verification: "Legacy reference; previously AHAM Verified",
    price: "Legacy price: $99.99; no longer sold",
    availability: "Discontinued — legacy reference",
    variants: "Previously offered in White or Silver; standard, two-pack, value-pack, and SMART versions",
    features: "3 fan speeds, timer, sleep mode, filter indicator, touch controls; SMART version added UV and Alexa support",
    dimensions: 'Approx. 15" H x 10.5" W x 10.5" D (legacy listing)',
    weight: "Approx. 7 lbs",
    wattage: "Not listed in the current catalog",
    controls: "Timer, 3 Fan Speeds, Sleep Mode, Filter Indicator, Touch Controls",
    fanSpeeds: "3 Speeds",
    warranty: "Legacy product; coverage subject to original purchase eligibility and current warranty terms",
    coverageArea: "60 min: 586 sq ft (1 ACH); 30 min: 293 sq ft (2 ACH); 15 min: 146.5 sq ft (4 ACH); 12 min: 117 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 49 m³/h; Speed 2: 77 m³/h; Speed 3: 160 m³/h (legacy support data)",
    cadrByParticle: "Not listed in the current catalog",
    ief: "Not listed",
    annualEnergy: "Not listed",
    ahamVerifiedAt: "Legacy model; current listing unavailable",
    filterLife: "2,500 hours (estimated 3–4 months)",
    filterConfiguration: "Pre-filter, True HEPA H13, Activated Carbon",
    soundLevel: "Speed 1: 31.8 dBA; Speed 2: 37.0 dBA; Speed 3: 49.1 dBA (legacy support data)",
    onWheels: "No",
  },
  {
    id: "ma-22",
    name: "MA-22 Air Purifier",
    url: "https://medifyair.com/products/ma-22-air-purifier",
    coverage: "278 sq ft in 30 minutes",
    bestFor: "Medium rooms; bedrooms, nurseries, and offices",
    filter: "True HEPA H13",
    verification: "AHAM Verified",
    price: "$110.99",
    availability: "Available",
    variants: "Single / White; Single / Black; Two-Pack / Black",
    features: "0-8 hour timer, 3 fan speeds, sleep mode, filter indicator, touch controls",
    dimensions: '15" H x 10" W x 10" D',
    weight: "7 lbs",
    wattage: "38W",
    controls: "Preset Timers, 3 Fan Speeds, Touch Controls, Child Lock",
    fanSpeeds: "3 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 555 sq ft (1 ACH); 30 min: 278 sq ft (2 ACH); 15 min: 139 sq ft (4 ACH); 12 min: 111 sq ft (5 ACH)",
    cadrBySpeed: "Not listed",
    cadrByParticle: "Smoke: 74 CFM (126 m³/h); Dust: 82 CFM (139 m³/h); Pollen: 75 CFM (127 m³/h); PM2.5: 78 CFM (133 m³/h)",
    ief: "2",
    annualEnergy: "223 kWh/year",
    ahamVerifiedAt: "116 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "2,000 hours (3-4 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Sleep: 21.3 dBA; Speed 1: 33.0 dBA; Speed 2: 44.8 dBA; Speed 3: 52.4 dBA",
    onWheels: "No",
  },
  {
    id: "ma-25",
    name: "MA-25 Air Purifier",
    url: "https://medifyair.com/products/medify-ma-25-air-purifier",
    coverage: "413 sq ft in 30 minutes",
    bestFor: "Medium rooms; bedrooms, living rooms, and kitchens",
    filter: "True HEPA H13",
    verification: "AHAM Verified",
    price: "$148.99",
    availability: "Available",
    variants: "White or Silver; Single or Two-Pack",
    features: "Tabletop purifier; preset timers, filter indicator, child lock, dimmer, touch controls",
    dimensions: '13.5" H x 8" W x 8" D',
    weight: "7.3 lbs",
    wattage: "28W",
    controls: "Preset Timers, 3 Fan Speeds, Filter Indicator, Touch Controls, Child Lock, Dimmer",
    fanSpeeds: "3 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 825 sq ft (1 ACH); 30 min: 413 sq ft (2 ACH); 15 min: 206 sq ft (4 ACH); 12 min: 165 sq ft (5 ACH)",
    cadrBySpeed: "Not listed",
    cadrByParticle: "Smoke: 110 CFM (187 m³/h); Dust: 123 CFM (209 m³/h); Pollen: 123 CFM (209 m³/h); PM2.5: 116 CFM (197 m³/h)",
    ief: "4.4",
    annualEnergy: "160 kWh/year",
    ahamVerifiedAt: "172 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "2,500 hours (3-4 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Speed 1: 19.8 dBA; Speed 2: 37 dBA; Speed 3: 49.3 dBA",
    onWheels: "No",
  },
  {
    id: "ma-35",
    name: "MA-35 Air Purifier",
    url: "https://medifyair.com/products/ma-wm35",
    coverage: "656 sq ft in 30 minutes",
    bestFor: "Large rooms; bedrooms, living rooms, and offices",
    filter: "True HEPA H13",
    verification: "AHAM Verified / FDA-Cleared",
    price: "$179.99",
    availability: "Available",
    variants: "White, Black, or Silver",
    features: "Wall-mounted design; 0-24 hour timer; optional ionizer; sleep mode; child lock",
    dimensions: '15.6" H x 23.2" W x 3.9" D',
    weight: "16 lbs",
    wattage: "40W",
    controls: "Preset Timers, 3 Fan Speeds, Sleep Mode, Filter Indicator, Touch Controls, Child Lock, Ionizer (Optional)",
    fanSpeeds: "3 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 1,312 sq ft (1 ACH); 30 min: 656 sq ft (2 ACH); 15 min: 328 sq ft (4 ACH); 12 min: 260 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 52.4 CFM (89 m³/h); Speed 2: 120.8 CFM (205 m³/h); Speed 3: 173.2 CFM (294 m³/h)",
    cadrByParticle: "Smoke: 173.2 CFM (294 m³/h); Dust: 178 CFM (302 m³/h); Pollen: 200 CFM (340 m³/h); PM2.5: 177 CFM (301 m³/h)",
    ief: "4.9",
    annualEnergy: "211 kWh/year",
    ahamVerifiedAt: "271 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "2,500 hours (3-4 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Speed 1: 29 dBA; Speed 2: 46.4 dBA; Speed 3: 54.1 dBA",
    onWheels: "No",
  },
  {
    id: "ma-40",
    name: "MA-40 Air Purifier",
    url: "https://medifyair.com/products/medify-ma-40",
    coverage: "896 sq ft in 30 minutes",
    bestFor: "Large rooms; bedrooms, living rooms, and kitchens",
    filter: "True HEPA H13 or H14",
    verification: "AHAM Verified / FDA-Cleared",
    price: "$249.99",
    availability: "Available",
    variants: "White or Black; Single or Two-Pack; HEPA or HEPA + UV Light",
    features: "Preset timers, sleep mode, optional ionizer, UV-light variant, child lock, touch controls",
    dimensions: '22" H x 9.9" W x 10.9" D',
    weight: "17.5 lbs",
    wattage: "68W",
    controls: "Preset Timers, 3 Fan Speeds, Sleep Mode, Filter Indicator, Touch Controls, Child Lock, Ionizer (Optional)",
    fanSpeeds: "3 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 1,793 sq ft (1 ACH); 30 min: 896 sq ft (2 ACH); 15 min: 448 sq ft (4 ACH); 12 min: 358.5 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 144.3 CFM (245 m³/h); Speed 2: 181.2 CFM (308 m³/h); Speed 3: 239 CFM (406 m³/h); Sleep: 111.8 CFM (190 m³/h)",
    cadrByParticle: "Smoke: 239 CFM (406 m³/h); Dust: 231 CFM (392 m³/h); Pollen: 240 CFM (407.76 m³/h); PM2.5: 235 CFM (399.26 m³/h)",
    ief: "3.6",
    annualEnergy: "374 kWh/year",
    ahamVerifiedAt: "373 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "3,000 hours (4-5 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Sleep/Speed 1: 40.5 dB; Speed 2: 50.3 dB; Speed 3: 53.3 dB",
    onWheels: "No",
  },
  {
    id: "ma-50-v3",
    name: "MA-50-V3.0 Air Purifier",
    url: "https://medifyair.com/products/ma-50-air-purifier",
    coverage: "1,320 sq ft in 30 minutes",
    bestFor: "Extra-large rooms and open spaces; homes, offices, gyms, and classrooms",
    filter: "True HEPA H13 or H14",
    verification: "AHAM Verified",
    price: "$299.99",
    availability: "Available",
    variants: "White / 1-Pack",
    features: "2-12 hour timer, sleep mode, filter indicator, child lock, dimmer, touch controls",
    dimensions: '21.18" H x 9.65" W x 9.65" D',
    weight: "10 lbs",
    wattage: "70W",
    controls: "Preset Timers, 4 Fan Speeds, Sleep Mode, Filter Indicator, Touch Controls, Child Lock, Dimmer",
    fanSpeeds: "4 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 2,640 sq ft (1 ACH); 30 min: 1,320 sq ft (2 ACH); 15 min: 660 sq ft (4 ACH); 12 min: 528 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 19.0 CFM (32 m³/h); Speed 2: 90.6 CFM (154 m³/h); Speed 3: 159.5 CFM (271 m³/h); Speed 4: 352 CFM (598 m³/h)",
    cadrByParticle: "Smoke: 352 CFM (598 m³/h); Dust: 379 CFM (644 m³/h); Pollen: 397 CFM (675 m³/h); PM2.5: 365 CFM (620 m³/h)",
    ief: "4.9",
    annualEnergy: "434 kWh/year",
    ahamVerifiedAt: "550 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "2,500 hours (3-4 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Sleep: 21.7 dBA; Speed 1: 21.2 dBA; Speed 2: 32.3 dBA; Speed 3: 42.7 dBA; Speed 4: 60.6 dBA",
    onWheels: "No",
  },
  {
    id: "ma-112",
    name: "MA-112 Air Purifier",
    url: "https://medifyair.com/products/ma-112",
    coverage: "2,228 sq ft in 30 minutes",
    bestFor: "Extra-large rooms; bedrooms, living rooms, and basements",
    filter: "True HEPA H13 or H14",
    verification: "AHAM Verified",
    price: "$594.99",
    availability: "Available",
    variants: "White or Black; 1-Pack; HEPA or HEPA + UV Light",
    features: "0-8 hour timer, sleep mode, filter indicator, child lock, touch controls, wheels",
    dimensions: '28" H x 16" W x 16" D',
    weight: "33.5 lbs",
    wattage: "95W",
    controls: "Preset Timers, 4 Fan Speeds, Sleep Mode, Filter Indicator, Touch Controls, Child Lock",
    fanSpeeds: "4 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 4,455 sq ft (1 ACH); 30 min: 2,228 sq ft (2 ACH); 15 min: 1,114 sq ft (4 ACH); 12 min: 891 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 212.1 CFM (360 m³/h); Speed 2: 289.2 CFM (491 m³/h); Speed 3: 375.8 CFM (638 m³/h); Speed 4: 594 CFM (1,009 m³/h); Sleep: 120.7 CFM (205 m³/h)",
    cadrByParticle: "Smoke: 594 CFM (1,009 m³/h); Dust: >600 CFM (>1,019 m³/h); Pollen: >450 CFM (>765 m³/h); PM2.5: 598 CFM (1,016 m³/h)",
    ief: "5.1",
    annualEnergy: "690 kWh/year",
    ahamVerifiedAt: "928 sq ft every 12.5 minutes (4.8 ACH)",
    filterLife: "3,000 hours (4-5 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Speed 1: 35.8 dBA; Speed 2: 41 dBA; Speed 3: 49.6 dBA; Sleep Mode: 56.5 dBA (as listed on Medify product page)",
    onWheels: "Yes",
  },
  {
    id: "ma-112-pro",
    name: "MA-112 PRO Air Purifier",
    url: "https://medifyair.com/products/ma-112-pro-air-purifier-white",
    coverage: "2,974 sq ft in 30 minutes",
    bestFor: "Extra-large rooms; bedrooms, living rooms, and basements",
    filter: "True HEPA H13 or H14",
    verification: "AHAM Verified (CFM above 600 is factory-tested)",
    price: "$594.99",
    availability: "Available",
    variants: "White / Default variant",
    features: "2-12 hour timer, sleep mode, filter indicator, child lock, touch controls, wheels",
    dimensions: '28" H x 13" W x 13" D',
    weight: "29.5 lbs",
    wattage: "95W",
    controls: "Preset Timers, 4 Fan Speeds, Sleep Mode, Filter Indicator, Touch Controls, Child Lock",
    fanSpeeds: "4 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 5,948 sq ft (1 ACH); 30 min: 2,974 sq ft (2 ACH); 15 min: 1,487 sq ft (4 ACH); 12 min: 1,190 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 171 CFM (291 m³/h); Speed 2: 387 CFM (658 m³/h); Speed 3: 539 CFM (916 m³/h); Speed 4: 793 CFM (1,347 m³/h)",
    cadrByParticle: "Smoke: 793 CFM (1,347 m³/h); Dust: 723 CFM (1,228 m³/h); Pollen: 775 CFM (1,316 m³/h); PM2.5: >600 CFM (>1,019 m³/h)",
    ief: "Not listed",
    annualEnergy: "Not listed",
    ahamVerifiedAt: "AHAM verifies up to 600 CFM; higher speeds are factory-tested",
    filterLife: "3,000 hours (4-5 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Speed 1: 24.6 dBA; Speed 2: 41.7 dBA; Speed 3: 52.3 dBA; Speed 4: 58.1 dBA",
    onWheels: "Yes",
  },
  {
    id: "ma-125",
    name: "MA-125 Air Purifier",
    url: "https://medifyair.com/products/ma-125-air-purifier",
    coverage: "2,051 sq ft in 30 minutes",
    bestFor: "Extra-large rooms; bedrooms, nurseries, and offices",
    filter: "True HEPA H14",
    verification: "AHAM Verified",
    price: "$399.99 sale (regular $594.99)",
    availability: "Out of stock",
    variants: "Black",
    features: "0-24 hour timer, 9 fan speeds, dimmer, optional UV light, filter indicator, touch screen, wheels",
    dimensions: '27" H x 19" W x 20" D',
    weight: "37 lbs",
    wattage: "132W",
    controls: "Preset Timers, 9 Fan Speeds, Dimmer, UV Light (Optional), Filter Indicator, Touch Screen",
    fanSpeeds: "9 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "60 min: 4,102 sq ft (1 ACH); 30 min: 2,051 sq ft (2 ACH); 15 min: 1,025 sq ft (4 ACH); 12 min: 1,171.5 sq ft (5 ACH)",
    cadrBySpeed: "Speed 1: 147.5 CFM (251 m³/h); Speed 2: 232 CFM (394 m³/h); Speed 3: 313 CFM (531 m³/h); Speed 4: 413 CFM (701 m³/h); Speed 5: 513 CFM (871 m³/h); Speed 6: 578 CFM (982 m³/h); Speed 7: 631 CFM (1,072 m³/h); Speed 8: 708 CFM (1,202 m³/h); Speed 9: 781 CFM (1,326 m³/h)",
    cadrByParticle: "Smoke: 781 CFM (1,327 m³/h)",
    ief: "Not listed",
    annualEnergy: "Not listed",
    ahamVerifiedAt: "Not listed",
    filterLife: "3,000 hours (4-5 months)",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Speed 1: 33.4 dBA; Speed 2: 36.9 dBA; Speed 3: 42.5 dBA; Speed 4: 47.5 dBA; Speed 5: 51.8 dBA; Speed 6: 54 dBA; Speed 7: 56.1 dBA; Speed 8: 58.1 dBA; Speed 9: 62.7 dBA",
    onWheels: "Yes",
  },
  {
    id: "ma-1400-pro",
    name: "MA-1400 PRO Air Purifier",
    url: "https://medifyair.com/products/ma-1400-pro-air-purifier",
    coverage: "1,848 sq ft in 12 minutes",
    bestFor: "Extra-large and professional spaces",
    filter: "HEPA with activated carbon",
    verification: "AHAM Verified",
    price: "$3,399.99",
    availability: "Available",
    variants: "Default variant",
    features: "Commercial/professional unit; 4 fan speeds, timer, child lock, touch controls, wheels",
    dimensions: '46" H x 17.7" W x 17.7" L',
    weight: "Not listed",
    wattage: "230W",
    controls: "Fan Speed, Timer, Child Lock",
    fanSpeeds: "4 Speeds",
    warranty: "Limited Lifetime Warranty",
    coverageArea: "1,848 sq ft in 12 minutes",
    cadrBySpeed: "Speed 1: 350 CFM (518 m³/h); Speed 2: 663 CFM (1,126 m³/h); Speed 3: 1,129 CFM (1,918 m³/h); Speed 4: 1,290 CFM (2,192 m³/h)",
    cadrByParticle: "Not listed",
    ief: "Not listed",
    annualEnergy: "Not listed",
    ahamVerifiedAt: "Not listed",
    filterLife: "Not listed",
    filterConfiguration: "Pre-filter, HEPA, Active Carbon Composite",
    soundLevel: "Speed 1: 40.9 dBA; Speed 2: 56.2 dBA; Speed 3: 67 dBA; Speed 4: 70.3 dBA",
    onWheels: "Yes",
  },
];

function normalizeTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(/[,|;]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function legacyCannedResponses() {
  return (data.records || [])
    .filter((item) => !isHiddenRecord(item))
    .map((item, index) => ({
      id: item.id,
      order: 10000 + index,
      sourceType: "script",
      title: item.title,
      category: item.section || item.sheet || "General",
      useCase: item.sheet || "",
      productModel: baseModel(`${item.title} ${item.body}`),
      tags: [item.sheet, item.section, baseModel(`${item.title} ${item.body}`)].filter(Boolean).slice(0, 5),
      responseText: item.body,
      dateUpdated: "",
      cell: item.cell,
    }));
}

function allCannedResponses() {
  const sheetResponses = (supportLibrary.cannedResponses || []).map((item, index) => ({
    ...item,
    order: index,
    sourceType: "canned",
    tags: normalizeTags(item.tags),
  }));
  const seen = new Set();
  return [...sheetResponses, ...legacyCannedResponses()].filter((item) => {
    const key = norm(`${item.title}|${item.responseText}`).replace(/\s+/g, " ").slice(0, 320);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function allTickets() {
  const stockPattern = /\b(stock|stocks|inventory|availability)\b/i;
  return (supportLibrary.tickets || []).map((item, index) => ({
    ...item,
    order: index,
    tags: normalizeTags(item.tags),
  })).filter((item) => !stockPattern.test(`${item.title} ${item.category} ${item.issueType} ${item.summary} ${item.notes} ${item.response} ${(item.tags || []).join(" ")}`));
}

function kbCategoryFor(page) {
  const text = norm(`${page.title} ${page.summary} ${(page.keywords || []).join(" ")} ${(page.steps || []).join(" ")}`);
  if (text.includes("warranty")) return "Warranty";
  if (text.includes("return")) return "Returns";
  if (text.includes("replacement") || text.includes("duplicate order")) return "Replacements";
  if (text.includes("recharge") || text.includes("subscription") || text.includes("filter club")) return "Filter Club / Subscriptions";
  if (text.includes("troubleshooting") || text.includes("sensor") || text.includes("power") || text.includes("uv")) return "Troubleshooting";
  if (text.includes("manual")) return "Product Manuals";
  if (text.includes("shipping") || text.includes("package") || text.includes("ups")) return "Shipping";
  if (text.includes("order") || text.includes("cancel")) return "Order Issues";
  if (text.includes("refund")) return "Refunds";
  if (text.includes("damaged")) return "Damaged Items";
  if (text.includes("missing") || text.includes("lost")) return "Missing Packages";
  if (text.includes("spec") || text.includes("cadr") || text.includes("cfm")) return "Product Specs";
  if (text.includes("escalation") || page.category === "CSR" || page.category === "CSM") return "Agent SOPs";
  return page.category || "Agent SOPs";
}

function productModelFor(value) {
  const match = String(value || "").toUpperCase().match(/MA-?\d{2,4}|H1[34]|UV/);
  if (!match) return "";
  return match[0].startsWith("MA") ? match[0].replace("MA", "MA-").replace("MA--", "MA-") : match[0];
}

function kbArticles() {
  const seen = new Set();
  return (internalKb.pages || [])
    .map((page, index) => {
      const tags = normalizeTags([...(page.keywords || []), page.category, productModelFor(`${page.title} ${page.summary}`)].filter(Boolean));
      const category = kbCategoryFor(page);
      return {
        id: page.id || `kb-${index}`,
        order: index,
        title: page.title,
        category,
        originalCategory: page.category,
        productModel: productModelFor(`${page.title} ${page.summary} ${(page.keywords || []).join(" ")}`),
        tags,
        summary: page.summary || "",
        content: page.summary || "",
        steps: page.steps || [],
        relatedResponses: [],
        relatedTickets: [],
        lastUpdated: page.lastUpdated || "",
        sourceUrl: page.url || internalKb.sourceUrl || "",
      };
    })
    .filter((article) => {
      const key = norm(`${article.title}|${article.summary}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function norm(value) {
  return String(value ?? "").toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlight(text) {
  const safe = escapeHtml(text);
  const query = state.query.trim();
  if (!query) return safe;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(`(${escaped})`, "ig"), "<mark>$1</mark>");
}

function filteredRecords(source = data.records) {
  const q = norm(state.query);
  return source.filter((item) => !isHiddenRecord(item)).filter((item) => {
    const matchesQuery = !q || norm(`${item.title} ${item.body} ${item.sheet} ${item.section}`).includes(q);
    const matchesSheet = state.sheet === "All sheets" || item.sheet === state.sheet;
    const matchesSection = state.section === "All sections" || item.section === state.section;
    return matchesQuery && matchesSheet && matchesSection;
  });
}

function splitTerms(value) {
  return norm(value)
    .split(/[^a-z0-9-]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length > 1);
}

function scoreText(haystack, query) {
  const q = norm(query).trim();
  if (!q) return 1;
  const text = norm(haystack);
  if (text.includes(q)) return 100;
  const terms = splitTerms(q);
  return terms.reduce((score, term) => score + (text.includes(term) ? 12 : 0), 0);
}

function kbSearchText(page) {
  return `${page.title} ${page.category} ${page.originalCategory} ${page.productModel} ${(page.tags || page.keywords || []).join(" ")} ${page.summary} ${page.content || ""} ${(page.steps || []).join(" ")}`;
}

function filteredKbPages() {
  const q = state.kbQuery || state.query;
  return kbArticles()
    .filter((page) => state.kbCategory === "All" || page.category === state.kbCategory)
    .filter((page) => state.kbTag === "All tags" || (page.tags || []).includes(state.kbTag))
    .map((page) => ({ page, score: scoreText(kbSearchText(page), q) }))
    .filter((item) => !q.trim() || item.score > 0)
    .sort((a, b) => (q.trim() ? b.score - a.score || a.page.title.localeCompare(b.page.title) : a.page.order - b.page.order))
    .map((item) => item.page);
}

function isHiddenRecord(item) {
  const sheet = norm(item.sheet);
  const title = norm(item.title);
  const section = norm(item.section);
  return sheet === "manual and warranty" || title === "untitled" || section === "manual and warranty";
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function copyHash(value) {
  let hash = 0;
  const input = String(value || "");
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function completedCopyKey(button) {
  return button?.dataset.copyKey || `copy-${copyHash(`${button?.dataset.copyLabel || ""}|${button?.dataset.copyText || button?.textContent || ""}`)}`;
}

function saveCompletedCopies() {
  localStorage.setItem("cjeiCompletedCopies", JSON.stringify([...completedCopies]));
}

function shouldMarkCompleted(button) {
  if (!button) return false;
  if (button.dataset.markCompleted === "true") return true;
  const label = (button.dataset.copyLabel || "").toLowerCase();
  const cardTitle = (button.closest(".note-template-card")?.querySelector(".note-template-card-head strong")?.textContent || "").toLowerCase();
  return label.includes("email copied") || cardTitle === "for email" || cardTitle === "outbound email";
}

function markCopyCompleted(button, persist = true) {
  if (!button) return;
  const key = completedCopyKey(button);
  if (persist) {
    completedCopies.add(key);
    saveCompletedCopies();
  }

  const card = button.closest(".note-template-card, .ticket-card, .knowledge-card, .unified-card, .card");
  button.classList.add("is-completed-copy");

  // Keep this update idempotent. Replacing the same text node repeatedly would
  // retrigger the page MutationObserver and could lock the interface in a loop.
  if (button.textContent !== "Completed ✓") {
    button.textContent = "Completed ✓";
  }
  if (button.getAttribute("aria-label") !== "Completed copy item") {
    button.setAttribute("aria-label", "Completed copy item");
  }

  if (card) {
    card.classList.add("is-completed");
    const header = card.querySelector(".note-template-card-head, .knowledge-top, .ticket-card-head, .card-head, .card-header") || card;
    if (!card.querySelector(".copy-completed-badge")) {
      const badge = document.createElement("span");
      badge.className = "copy-completed-badge";
      badge.textContent = "Completed ✓";
      header.appendChild(badge);
    }
  }
}

function restoreCompletedCopies() {
  document.querySelectorAll("[data-copy-text], [data-copy]").forEach((button) => {
    if (shouldMarkCompleted(button) && completedCopies.has(completedCopyKey(button))) {
      markCopyCompleted(button, false);
    }
  });
}

async function copyText(text, message = "Copied to clipboard", button = null) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  if (button) {
    if (shouldMarkCompleted(button)) {
      markCopyCompleted(button, true);
      button.classList.add("is-copied");
      window.setTimeout(() => button.classList.remove("is-copied"), 900);
    } else {
      const original = button.textContent;
      button.textContent = "Copied!";
      button.classList.add("is-copied");
      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove("is-copied");
      }, 1500);
    }
  }
  showToast(message);
}

function persistSaved() {
  localStorage.setItem("wagmiSavedScripts", JSON.stringify([...state.saved]));
}

function toggleSaved(id) {
  if (state.saved.has(id)) {
    state.saved.delete(id);
    showToast("Removed from saved scripts");
  } else {
    state.saved.add(id);
    showToast("Saved item");
  }
  persistSaved();
  renderCurrentView();
}

function renderCards(records, target) {
  if (!records.length) {
    target.innerHTML = `<div class="empty">No matching entries yet. Try a broader search or switch sheets.</div>`;
    return;
  }

  target.innerHTML = records
    .map(
      (item) => `
      <article class="card">
        <div class="card-head">
          <div>
            <h3>${highlight(item.title)}</h3>
            <div class="meta">
              <span class="tag">${escapeHtml(item.sheet)}</span>
              <span class="tag">${escapeHtml(item.section)}</span>
              <span>${escapeHtml(item.cell)}</span>
            </div>
          </div>
          <button class="action ${state.saved.has(item.id) ? "saved" : ""}" data-save="${escapeHtml(item.id)}" title="Save script">*</button>
          <button class="action" data-copy="${escapeHtml(item.id)}" title="Copy script">CP</button>
        </div>
        <div class="card-body">${highlight(item.body)}</div>
      </article>
    `,
    )
    .join("");
}

function responseSearchText(item) {
  return `${item.title} ${item.category} ${item.useCase} ${item.productModel} ${(item.tags || []).join(" ")} ${item.responseText}`;
}

function filteredCannedResponses(source = allCannedResponses()) {
  const q = state.cannedQuery || state.query;
  return source
    .map((item) => ({ item, score: scoreText(responseSearchText(item), q) }))
    .filter(({ item, score }) => {
      const matchesQuery = !q.trim() || score > 0;
      const matchesCategory = state.cannedCategory === "All categories" || item.category === state.cannedCategory;
      const model = item.productModel || "No model";
      const matchesModel = state.cannedModel === "All models" || model === state.cannedModel;
      return matchesQuery && matchesCategory && matchesModel;
    })
    .sort((a, b) => (q.trim() ? b.score - a.score || a.item.title.localeCompare(b.item.title) : a.item.title.localeCompare(b.item.title) || a.item.category.localeCompare(b.item.category)))
    .map(({ item }) => item);
}

function renderCannedCards(records, target) {
  if (!records.length) {
    target.innerHTML = `<div class="empty animated-empty">No responses found. Try another keyword or clear filters.</div>`;
    return;
  }

  target.innerHTML = records
    .map((item) => {
      const preview = item.responseText.length > 640 ? `${item.responseText.slice(0, 640)}...` : item.responseText;
      const saved = state.saved.has(item.id);
      return `
        <article class="card canned-card">
          <div class="card-head">
            <div>
              <h3>${highlight(item.title)}</h3>
              <div class="meta">
                <span class="tag">${escapeHtml(item.category || "General")}</span>
                ${item.productModel ? `<span class="tag">${escapeHtml(item.productModel)}</span>` : ""}
                ${item.useCase ? `<span>${highlight(item.useCase)}</span>` : ""}
              </div>
            </div>
            <button class="action ${saved ? "saved" : ""}" data-save="${escapeHtml(item.id)}" title="Save response">*</button>
            <button class="action" data-copy-text="${escapeHtml(item.responseText)}" data-copy-label="Response copied" title="Copy response">CP</button>
          </div>
          <div class="tag-row">${(item.tags || []).slice(0, 6).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="card-body">${highlight(preview)}</div>
        </article>`;
    })
    .join("");
}

function renderCannedResponses() {
  const records = filteredCannedResponses();
  els.resultCount.textContent = `${records.length} shown`;
  renderCannedCards(records, els.cards);
}

function renderKnowledgeCards(items, target) {
  if (!items.length) {
    target.innerHTML = `<div class="empty">No matching knowledge entries yet. Try another keyword, model, or process name.</div>`;
    return;
  }

  target.innerHTML = items
    .map((item) => {
      if (item.type === "script") {
        return `
          <article class="knowledge-card">
            <div class="knowledge-top">
              <span class="source-badge">Response</span>
              <span>${escapeHtml(item.sheet)}</span>
            </div>
            <h3>${highlight(item.title)}</h3>
            <p>${highlight(item.body.length > 520 ? `${item.body.slice(0, 520)}...` : item.body)}</p>
            <div class="knowledge-actions">
              <button class="primary-action" type="button" data-copy-text="${escapeHtml(item.body)}" data-copy-label="Response copied">Copy response</button>
              <button class="secondary-action" type="button" data-save="${escapeHtml(item.id)}">${state.saved.has(item.id) ? "Saved" : "Save"}</button>
            </div>
          </article>`;
      }

      if (item.type === "ticket") {
        return `
          <article class="knowledge-card">
            <div class="knowledge-top">
              <span class="source-badge">Ticket</span>
              <span>${escapeHtml(item.category || "General")}</span>
            </div>
            <h3>${highlight(item.title)}</h3>
            <p>${highlight(item.summary || item.notes || "Ticket reference")}</p>
            <div class="meta">
              <span class="tag">${escapeHtml(item.productModel || "No model")}</span>
              <span class="tag">${escapeHtml(item.status || "Reference")}</span>
            </div>
            <div class="knowledge-actions">
              <button class="primary-action" type="button" data-ticket-detail="${escapeHtml(item.id)}">View Details</button>
              ${item.notes ? `<button class="secondary-action" type="button" data-copy-text="${escapeHtml(item.notes)}" data-copy-label="Ticket note copied">Copy notes</button>` : ""}
            </div>
          </article>`;
      }

      if (item.type === "manual") {
        return `
          <article class="knowledge-card media-card">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />` : ""}
            <div>
              <div class="knowledge-top">
                <span class="source-badge">Manual</span>
                <span>${escapeHtml(item.model)}</span>
              </div>
              <h3>${highlight(item.title)}</h3>
              <p>${highlight((item.bullets || []).join(" "))}</p>
              <div class="knowledge-actions">
                ${item.manualUrl ? `<a class="primary-link" href="${escapeHtml(item.manualUrl)}" target="_blank" rel="noreferrer">Open manual</a>` : ""}
                ${item.productUrl ? `<a class="secondary-link" href="${escapeHtml(item.productUrl)}" target="_blank" rel="noreferrer">Product page</a>` : ""}
              </div>
            </div>
          </article>`;
      }

      return `
        <article class="knowledge-card">
          <div class="knowledge-top">
            <span class="source-badge">${escapeHtml(item.category)}</span>
            <span>Internal KB</span>
          </div>
          <h3>${highlight(item.title)}</h3>
          <p>${highlight(item.summary)}</p>
          ${(item.steps || []).length ? `<ol>${item.steps.slice(0, 5).map((step) => `<li>${highlight(step)}</li>`).join("")}</ol>` : ""}
          <div class="knowledge-actions">
            <button class="primary-action" type="button" data-kb-detail="${escapeHtml(item.id)}">View KB Article</button>
          </div>
        </article>`;
    })
    .join("");
}

function hubItems() {
  const q = state.query;
  const records = allCannedResponses()
    .map((item) => ({ ...item, type: "script", body: item.responseText, sheet: item.category, section: item.useCase, score: scoreText(responseSearchText(item), q) }))
    .filter((item) => !q.trim() || item.score > 0);
  const tickets = allTickets()
    .map((item) => ({ ...item, type: "ticket", score: scoreText(ticketSearchText(item), q) }))
    .filter((item) => !q.trim() || item.score > 0);
  const pages = kbArticles()
    .map((page) => ({ ...page, type: "kb", score: scoreText(kbSearchText(page), q) }))
    .filter((item) => !q.trim() || item.score > 0);
  const manuals = (medifyManuals.manuals || [])
    .map((item) => ({ ...item, type: "manual", score: scoreText(`${item.title} ${item.model} ${(item.bullets || []).join(" ")}`, q) }))
    .filter((item) => !q.trim() || item.score > 0);

  return [...pages, ...tickets, ...records, ...manuals]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, q.trim() ? 80 : 18);
}

function renderHub() {
  const items = hubItems();
  els.hubCount.textContent = state.query.trim() ? `${items.length} matches` : "top knowledge cards";
  renderKnowledgeCards(items, els.hubResults);
}

function renderInternalKb() {
  const pages = filteredKbPages();
  els.internalKbCount.textContent = `${pages.length} shown`;
  if (!pages.length) {
    els.internalKbList.innerHTML = `<div class="empty animated-empty">No KB articles found. Try another keyword or clear filters.</div>`;
    return;
  }
  els.internalKbList.innerHTML = pages
    .map(
      (page) => `
      <article class="knowledge-card kb-article-card">
        <div class="knowledge-top">
          <span class="source-badge">${escapeHtml(page.category)}</span>
          ${page.productModel ? `<span>${escapeHtml(page.productModel)}</span>` : "<span>Internal KB</span>"}
        </div>
        <h3>${highlight(page.title)}</h3>
        <p>${highlight(page.summary)}</p>
        <div class="tag-row">${(page.tags || []).slice(0, 8).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="knowledge-actions">
          <button class="primary-action" type="button" data-kb-detail="${escapeHtml(page.id)}">View Details</button>
          <button class="secondary-action" type="button" data-copy-text="${escapeHtml(`${page.summary}\n\n${(page.steps || []).join("\n")}`)}" data-copy-label="KB article copied">Copy instructions</button>
          ${page.sourceUrl ? `<a class="secondary-link" href="${escapeHtml(page.sourceUrl)}" target="_blank" rel="noreferrer">Original source</a>` : ""}
        </div>
      </article>`,
    )
    .join("");
}

function renderScripts() {
  const records = filteredRecords();
  els.resultCount.textContent = `${records.length} shown`;
  renderCards(records, els.cards);
}

function renderFavorites() {
  const savedResponses = allCannedResponses().filter((item) => state.saved.has(item.id));
  const records = filteredCannedResponses(savedResponses);
  document.querySelector("#favoritesCount").textContent = `${records.length} shown`;
  renderCannedCards(records, els.favoritesList);
}

function ticketSearchText(item) {
  return `${item.title} ${item.issueType} ${item.category} ${item.productModel} ${item.status} ${(item.tags || []).join(" ")} ${item.summary} ${item.notes} ${item.response} ${item.ticketId}`;
}

function renderTicketNoteTemplates() {
  if (!els.ticketNoteTemplateGrid) return;
  if (els.ticketNoteTemplateCount) {
    els.ticketNoteTemplateCount.textContent = `${ticketNoteTemplates.length} templates`;
  }
  els.ticketNoteTemplateGrid.innerHTML = ticketNoteTemplates
    .map((template) => `
      <article class="note-template-card ticket-note-template-card">
        <div class="note-template-card-head">
          <div>
            <strong>${escapeHtml(template.title)}</strong>
            <span>${escapeHtml(template.description)}</span>
          </div>
          <button class="note-template-copy" type="button" data-copy-text="${escapeHtml(template.text)}" data-copy-label="${escapeHtml(template.title)} copied" data-copy-key="${escapeHtml(template.id)}">Copy</button>
        </div>
        <pre>${escapeHtml(template.text)}</pre>
      </article>
    `)
    .join("");
}

function filteredTicketLinks() {
  const q = state.ticketLinkQuery.trim();
  return allTickets()
    .filter((ticket) => ticket.url)
    .map((ticket) => ({ ticket, score: scoreText(`${ticketSearchText(ticket)} ${ticket.url}`, q) }))
    .filter(({ score }) => !q || score > 0)
    .sort((a, b) => (q ? b.score - a.score || a.ticket.title.localeCompare(b.ticket.title) : a.ticket.title.localeCompare(b.ticket.title)))
    .map(({ ticket }) => ticket);
}

function renderTicketLinks() {
  if (!els.ticketLinkResults || !els.ticketLinkCount) return;
  const tickets = filteredTicketLinks();
  const q = state.ticketLinkQuery.trim();
  els.ticketLinkCount.textContent = q ? `${tickets.length} matching links` : `${tickets.length} saved links`;
  els.ticketLinkResults.innerHTML = tickets.length
    ? tickets.map((ticket) => `
        <article class="ticket-library-card ticket-link-card">
          <div class="ticket-card-main">
            <div>
              <h3>${highlight(ticket.title)}</h3>
              <p>${highlight(ticket.summary || ticket.notes || ticket.issueType || "Ticket reference")}</p>
            </div>
            <a class="primary-link ticket-open-link" href="${escapeHtml(ticket.url)}" target="_blank" rel="noreferrer">Open ticket</a>
          </div>
          <div class="meta">
            ${ticket.ticketId ? `<span class="tag">Ticket #${escapeHtml(ticket.ticketId)}</span>` : ""}
            <span class="tag">${escapeHtml(ticket.category || "General")}</span>
            ${ticket.productModel ? `<span class="tag">${escapeHtml(ticket.productModel)}</span>` : ""}
            ${ticket.status ? `<span class="tag">${escapeHtml(ticket.status)}</span>` : ""}
          </div>
          <div class="tag-row">${(ticket.tags || []).slice(0, 7).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</div>
          <div class="ticket-card-actions">
            <button class="secondary-action" type="button" data-ticket-detail="${escapeHtml(ticket.id)}">View details</button>
            <button class="secondary-action" type="button" data-copy-text="${escapeHtml(ticket.url)}" data-copy-label="Ticket link copied">Copy link</button>
          </div>
        </article>
      `).join("")
    : `<div class="empty animated-empty">No ticket links found. Try an issue, model, category, or ticket number.</div>`;
}

function filteredTickets() {
  const q = state.ticketQuery || state.query;
  return allTickets()
    .map((item) => ({ item, score: scoreText(ticketSearchText(item), q) }))
    .filter(({ item, score }) => {
      const matchesQuery = !q.trim() || score > 0;
      const matchesCategory = state.ticketCategory === "All categories" || item.category === state.ticketCategory;
      const matchesIssue = state.ticketIssue === "All issue types" || item.issueType === state.ticketIssue;
      const model = item.productModel || "No model";
      const matchesModel = state.ticketModel === "All models" || model === state.ticketModel;
      const matchesStatus = state.ticketStatus === "All statuses" || item.status === state.ticketStatus;
      const matchesTag = state.ticketTag === "All tags" || (item.tags || []).includes(state.ticketTag);
      return matchesQuery && matchesCategory && matchesIssue && matchesModel && matchesStatus && matchesTag;
    })
    .sort((a, b) => (q.trim() ? b.score - a.score || a.item.title.localeCompare(b.item.title) : a.item.title.localeCompare(b.item.title) || a.item.category.localeCompare(b.item.category)))
    .map(({ item }) => item);
}

function renderTicketLibrary() {
  const tickets = filteredTickets();
  els.ticketLibraryCount.textContent = `${tickets.length} shown`;
  els.ticketLibraryResults.innerHTML = tickets.length
    ? tickets
        .map(
          (ticket) => `
          <article class="ticket-library-card">
            <div class="ticket-card-main">
              <div>
                <h3>${highlight(ticket.title)}</h3>
                <p>${highlight(ticket.summary || ticket.notes || "Ticket reference")}</p>
              </div>
              <button class="secondary-action" type="button" data-ticket-detail="${escapeHtml(ticket.id)}">View Details</button>
            </div>
            <div class="meta">
              <span class="tag">${escapeHtml(ticket.category || "General")}</span>
              <span class="tag">${escapeHtml(ticket.issueType || "Issue")}</span>
              <span class="tag">${escapeHtml(ticket.productModel || "No model")}</span>
              <span class="tag">${escapeHtml(ticket.status || "Reference")}</span>
            </div>
            <div class="tag-row">${(ticket.tags || []).slice(0, 7).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</div>
            <div class="ticket-card-actions">
              ${ticket.response ? `<button class="primary-action" type="button" data-copy-text="${escapeHtml(ticket.response)}" data-copy-label="Ticket response copied">Copy response</button>` : ""}
              ${ticket.notes ? `<button class="secondary-action" type="button" data-copy-text="${escapeHtml(ticket.notes)}" data-copy-label="Ticket note copied">Copy notes</button>` : ""}
              ${ticket.url ? `<a class="secondary-link" href="${escapeHtml(ticket.url)}" target="_blank" rel="noreferrer">Open ticket</a>` : ""}
            </div>
          </article>`,
        )
        .join("")
    : `<div class="empty animated-empty">No tickets found. Try another keyword or clear filters.</div>`;
}

function openDetailDrawer() {
  els.ticketDrawerBackdrop.hidden = false;
  els.detailDrawer.classList.add("open");
  els.detailDrawer.setAttribute("aria-hidden", "false");
}

function openTicketDrawer(ticketId) {
  const ticket = allTickets().find((item) => item.id === ticketId);
  if (!ticket) return;
  els.detailDrawerContent.innerHTML = `
    <div class="drawer-section">
      <p class="section-kicker">Ticket details</p>
      <h2>${escapeHtml(ticket.title)}</h2>
      <div class="meta">
        <span class="tag">${escapeHtml(ticket.category || "General")}</span>
        <span class="tag">${escapeHtml(ticket.issueType || "Issue")}</span>
        <span class="tag">${escapeHtml(ticket.productModel || "No model")}</span>
        <span class="tag">${escapeHtml(ticket.status || "Reference")}</span>
      </div>
    </div>
    <div class="drawer-section">
      <h3>Summary</h3>
      <p>${escapeHtml(ticket.summary || "No summary provided.")}</p>
    </div>
    <div class="drawer-section">
      <h3>Notes</h3>
      <p>${escapeHtml(ticket.notes || "No notes provided.")}</p>
      ${ticket.notes ? `<button class="secondary-action" type="button" data-copy-text="${escapeHtml(ticket.notes)}" data-copy-label="Ticket note copied">Copy notes</button>` : ""}
    </div>
    <div class="drawer-section">
      <h3>Response</h3>
      <p>${escapeHtml(ticket.response || "No ready-to-use response provided for this ticket.")}</p>
      ${ticket.response ? `<button class="primary-action" type="button" data-copy-text="${escapeHtml(ticket.response)}" data-copy-label="Ticket response copied">Copy response</button>` : ""}
    </div>
    <div class="drawer-section tag-row">
      ${(ticket.tags || []).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}
    </div>
    ${ticket.url ? `<a class="primary-link" href="${escapeHtml(ticket.url)}" target="_blank" rel="noreferrer">Open original ticket</a>` : ""}`;
  openDetailDrawer();
}

function openKbDrawer(kbId) {
  const article = kbArticles().find((item) => item.id === kbId);
  if (!article) return;
  const reusable = `${article.summary}\n\n${(article.steps || []).join("\n")}`.trim();
  els.detailDrawerContent.innerHTML = `
    <div class="drawer-section">
      <p class="section-kicker">Internal KB</p>
      <h2>${escapeHtml(article.title)}</h2>
      <div class="meta">
        <span class="tag">${escapeHtml(article.category)}</span>
        ${article.productModel ? `<span class="tag">${escapeHtml(article.productModel)}</span>` : ""}
        ${article.lastUpdated ? `<span class="tag">${escapeHtml(article.lastUpdated)}</span>` : ""}
      </div>
    </div>
    <div class="drawer-section">
      <h3>Summary</h3>
      <p>${escapeHtml(article.summary || "No summary provided.")}</p>
    </div>
    <div class="drawer-section">
      <h3>Steps / Instructions</h3>
      ${(article.steps || []).length ? `<ol>${article.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>` : `<p>No steps provided yet.</p>`}
      ${reusable ? `<button class="primary-action" type="button" data-copy-text="${escapeHtml(reusable)}" data-copy-label="KB article copied">Copy instructions</button>` : ""}
    </div>
    <div class="drawer-section">
      <h3>Related Responses</h3>
      <div class="drawer-related">${filteredCannedResponses(allCannedResponses().filter((item) => scoreText(responseSearchText(item), article.title + " " + article.summary) > 0)).slice(0, 3).map((item) => `<button class="secondary-action" type="button" data-copy-text="${escapeHtml(item.responseText)}" data-copy-label="Response copied">${escapeHtml(item.title)}</button>`).join("") || "<p>No related responses found yet.</p>"}</div>
    </div>
    <div class="drawer-section">
      <h3>Related Tickets</h3>
      <div class="drawer-related">${allTickets().filter((item) => scoreText(ticketSearchText(item), article.title + " " + article.summary) > 0).slice(0, 3).map((item) => `<button class="secondary-action" type="button" data-ticket-detail="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>`).join("") || "<p>No related tickets found yet.</p>"}</div>
    </div>
    <div class="drawer-section tag-row">
      ${(article.tags || []).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}
    </div>
    ${article.sourceUrl ? `<a class="primary-link" href="${escapeHtml(article.sourceUrl)}" target="_blank" rel="noreferrer">Open Original Source</a>` : ""}`;
  openDetailDrawer();
}

function closeDetailDrawer() {
  els.detailDrawer.classList.remove("open");
  els.detailDrawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    els.ticketDrawerBackdrop.hidden = true;
  }, 180);
}

function currentTrack() {
  const playlist = focusMusic.playlist || [];
  if (!playlist.length) return null;
  state.musicIndex = Math.max(0, Math.min(state.musicIndex, playlist.length - 1));
  return playlist[state.musicIndex];
}

function saveMusicPrefs() {
  localStorage.setItem("wagmiMusicIndex", String(state.musicIndex));
  localStorage.setItem("wagmiMusicVolume", String(state.musicVolume));
  localStorage.setItem("wagmiMusicMuted", String(state.musicMuted));
}

function renderMusicPlayer() {
  const track = currentTrack();
  audio.volume = state.musicVolume;
  audio.muted = state.musicMuted;
  els.musicVolume.value = String(state.musicVolume);
  els.musicMute.textContent = state.musicMuted ? "Unmute" : "Mute";
  els.musicPlay.textContent = audio.paused ? "Play" : "Pause";
  if (!track) {
    els.musicTitle.textContent = "No track loaded";
    els.musicMeta.textContent = "Add safe audio URLs in focus_music.js";
    return;
  }
  els.musicTitle.textContent = track.title || "Untitled focus track";
  els.musicMeta.textContent = track.src ? `${track.artist || "Unknown source"} · ${track.license || "License not set"}` : "Add safe audio URLs in focus_music.js";
}

function loadMusicTrack(shouldPlay = false) {
  const track = currentTrack();
  if (!track || !track.src) {
    renderMusicPlayer();
    if (shouldPlay) showToast("Add a music URL in focus_music.js first");
    return;
  }
  audio.src = track.src;
  audio.loop = (focusMusic.playlist || []).length <= 1;
  audio.load();
  renderMusicPlayer();
  if (shouldPlay) {
    audio.play().then(() => {
      showToast("Focus music started");
      renderMusicPlayer();
    }).catch(() => showToast("Music file could not be played"));
  }
}

function toggleMusic() {
  const track = currentTrack();
  if (!track || !track.src) {
    showToast("Add a music URL in focus_music.js first");
    return;
  }
  if (!audio.src) loadMusicTrack(false);
  if (audio.paused) {
    audio.play().then(() => {
      showToast("Focus music started");
      renderMusicPlayer();
    }).catch(() => showToast("Music file could not be played"));
  } else {
    audio.pause();
    showToast("Focus music paused");
    renderMusicPlayer();
  }
}

function stepMusic(direction) {
  const playlist = focusMusic.playlist || [];
  if (!playlist.length) return;
  state.musicIndex = (state.musicIndex + direction + playlist.length) % playlist.length;
  saveMusicPrefs();
  loadMusicTrack(!audio.paused);
}

function renderManuals() {
  const q = norm(els.manualSearch.value || state.query);
  const rows = (medifyManuals.manuals || [])
    .filter((item) => !q || norm(`${item.title} ${item.model} ${item.bullets.join(" ")}`).includes(q))
    .sort((a, b) => String(a.model || a.title).localeCompare(String(b.model || b.title), undefined, { numeric: true }) || String(a.title || "").localeCompare(String(b.title || "")));
  els.manualsCount.textContent = `${rows.length} units`;
  els.warrantySummary.innerHTML = (medifyManuals.warrantySummary || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  els.manualCards.innerHTML = rows.length
    ? rows
        .map(
          (item) => `
          <article class="manual-card">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />` : `<div class="empty">No photo available</div>`}
            <div class="manual-content">
              <div>
                <span class="tag">${escapeHtml(item.model)}</span>
                <h3>${highlight(item.title)}</h3>
              </div>
              ${item.bullets.length ? `<ul>${item.bullets.map((bullet) => `<li>${highlight(bullet)}</li>`).join("")}</ul>` : ""}
              <p class="manual-warranty">Warranty: limited lifetime coverage is maintained through registration, proper use, proof of purchase, and genuine filter replacement per Medify's agreement.</p>
              <div class="manual-actions">
                ${item.manualUrl ? `<a href="${escapeHtml(item.manualUrl)}" target="_blank" rel="noreferrer">Download manual</a>` : ""}
                ${item.productUrl ? `<a class="secondary" href="${escapeHtml(item.productUrl)}" target="_blank" rel="noreferrer">Product page</a>` : ""}
              </div>
            </div>
          </article>`,
        )
        .join("")
    : `<div class="empty">No Medify manual matches that search.</div>`;
}

function uniqueReplacementCodes() {
  const seen = new Set();
  return (data.replacementCodes || []).filter((item) => {
    const key = `${item.category}|${item.reasonCode}|${item.description}`;
    if (!item.category || !item.reasonCode || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function replacementOutput(item, orderNumber) {
  const order = String(orderNumber || "").trim();
  return order ? `${item.category} | ${item.reasonCode} | ${order}` : `${item.category} | ${item.reasonCode}`;
}

function renderReplacementTool() {
  const codes = uniqueReplacementCodes();
  if (!codes.length) {
    els.generatedCode.textContent = "No replacement formulas found.";
    return;
  }

  const selectedIndex = Math.min(Number(els.replacementReason.value || 0), codes.length - 1);
  const current = codes[selectedIndex] || codes[0];
  els.replacementReason.innerHTML = codes
    .map((item, index) => `<option value="${index}">${escapeHtml(item.reasonCode)} - ${escapeHtml(item.description)}</option>`)
    .join("");
  els.replacementReason.value = String(selectedIndex);
  els.generatedCode.textContent = replacementOutput(current, els.replacementOrder.value);
  els.formulaNote.textContent = current.formula
    ? `Preserved formula: ${current.formula}`
    : "Formula behavior: category + reason code, plus order number when entered.";
}

function renderTicketTable() {
  const globalQuery = norm(state.query);
  const ticketQuery = norm(els.ticketSearch.value);
  const category = els.ticketCategory.value || "All categories";
  const sku = els.ticketSku.value || "All SKUs";
  const rows = (data.tickets || [])
    .filter((row) => {
      const haystack = norm(`${row.ticketId} ${row.type} ${row.sku} ${row.category} ${row.notes}`);
      const matchesGlobal = !globalQuery || haystack.includes(globalQuery);
      const matchesTicket = !ticketQuery || haystack.includes(ticketQuery);
      const matchesCategory = category === "All categories" || row.category === category;
      const matchesSku = sku === "All SKUs" || row.sku === sku;
      return matchesGlobal && matchesTicket && matchesCategory && matchesSku;
    })
    .slice(0, 80);
  els.ticketTable.innerHTML = rows.length
    ? `
    <div class="ticket-results">
        ${rows
          .map(
            (row) => `
            <article class="ticket-card">
              <div class="ticket-title">
                <a href="${escapeHtml(row.link)}" target="_blank" rel="noreferrer">${highlight(row.ticketId || "Open ticket")}</a>
                <span class="tag">${highlight(row.sku || "No SKU")}</span>
              </div>
              <div class="ticket-body"><strong>${highlight(row.type)}</strong></div>
              <div class="meta">
                <span class="tag">${highlight(row.category)}</span>
                ${row.notes ? `<span>${highlight(row.notes)}</span>` : ""}
              </div>
            </article>`,
          )
          .join("")}
    </div>`
    : `<div class="empty">No ticket examples match those keywords yet.</div>`;
}

function optionList(defaultLabel, values) {
  return [defaultLabel, ...new Set(values.filter(Boolean))].sort((a, b) =>
    a === defaultLabel ? -1 : b === defaultLabel ? 1 : a.localeCompare(b),
  );
}

function fillSelect(select, values, current) {
  select.innerHTML = values.map((item) => `<option>${escapeHtml(item)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

function initLibraryFilters() {
  const canned = allCannedResponses();
  fillSelect(els.cannedCategory, optionList("All categories", canned.map((item) => item.category)), state.cannedCategory);
  fillSelect(els.cannedModel, optionList("All models", canned.map((item) => item.productModel || "No model")), state.cannedModel);
  els.cannedChips.innerHTML = cannedKeywords.map((item) => `<button class="chip" type="button" data-canned-keyword="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");

  const tickets = allTickets();
  fillSelect(els.ticketLibraryCategory, optionList("All categories", tickets.map((item) => item.category)), state.ticketCategory);
  fillSelect(els.ticketLibraryIssue, optionList("All issue types", tickets.map((item) => item.issueType)), state.ticketIssue);
  fillSelect(els.ticketLibraryModel, optionList("All models", tickets.map((item) => item.productModel || "No model")), state.ticketModel);
  fillSelect(els.ticketLibraryStatus, optionList("All statuses", tickets.map((item) => item.status)), state.ticketStatus);
  fillSelect(els.ticketLibraryTag, optionList("All tags", tickets.flatMap((item) => item.tags || [])), state.ticketTag);
  els.ticketLibraryChips.innerHTML = ticketLibraryKeywords.map((item) => `<button class="chip" type="button" data-ticket-library-keyword="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");

  const articles = kbArticles();
  fillSelect(els.kbCategorySelect, optionList("All", articles.map((item) => item.category)), state.kbCategory);
  fillSelect(els.kbTagSelect, optionList("All tags", articles.flatMap((item) => item.tags || [])), state.kbTag);
  els.kbChips.innerHTML = kbKeywords.map((item) => `<button class="chip" type="button" data-kb-keyword="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
}

function productLabel(row) {
  const sku = row["Master SKU"] || row.SKU || "";
  const name = row.Name || "";
  return `${sku}${name && name !== sku ? ` - ${name}` : ""}`.trim();
}

function baseModel(value) {
  const match = String(value || "").toUpperCase().match(/MA-\d{2,4}/);
  return match ? match[0] : "";
}

function filteredProducts(searchValue = "") {
  const q = norm(searchValue || state.query);
  return (data.products || [])
    .filter((row) => row["Master SKU"] || row.Name)
    .filter((row) => !q || norm(`${row["Master SKU"]} ${row.Name}`).includes(q))
    .sort((a, b) => productLabel(a).localeCompare(productLabel(b), undefined, { numeric: true }))
    .slice(0, 180);
}

function renderUnitOptions(target) {
  const products = filteredProducts(target.search.value);
  const current = target.select.value;
  target.select.innerHTML = products
    .map((row, index) => `<option value="${index}">${escapeHtml(productLabel(row))}</option>`)
    .join("");
  if (current && products[Number(current)]) {
    target.select.value = current;
  }
}

function specRowsForProduct(product) {
  const model = baseModel(`${product["Master SKU"]} ${product.Name}`);
  if (!model) return [];
  return (data.specs || [])
    .map((row) => ({ metric: row.metric, value: row.values[model] }))
    .filter((row) => row.value);
}

function renderUnitDetails(target = { select: els.unitSelect, search: els.unitSearch, details: els.unitDetails }) {
  const products = filteredProducts(target.search.value);
  if (!products.length) {
    target.details.innerHTML = `<div class="empty">No product matches that unit search.</div>`;
    return;
  }
  const product = products[Math.min(Number(target.select.value || 0), products.length - 1)];
  const pounds = product["Pounds..."] || "0";
  const ounces = product["...plus Ounces"] || "0";
  const dimensions = `${product["Height (in.)"] || "-"} H x ${product["Width (in.)"] || "-"} W x ${product["Length (in.)"] || "-"} L`;
  const specs = specRowsForProduct(product);

  target.details.innerHTML = `
    <section class="detail-card">
      <h4>Dimensions</h4>
      <dl class="detail-list">
        <dt>SKU</dt><dd>${escapeHtml(product["Master SKU"])}</dd>
        <dt>Name</dt><dd>${escapeHtml(product.Name)}</dd>
        <dt>Brand</dt><dd>${escapeHtml(product.Brand || "Medify Air")}</dd>
        <dt>Weight</dt><dd>${escapeHtml(`${pounds} lb ${ounces} oz`)}</dd>
        <dt>Size</dt><dd>${escapeHtml(dimensions)}</dd>
      </dl>
    </section>
    <section class="detail-card">
      <h4>Specs</h4>
      ${
        specs.length
          ? `<dl class="detail-list">${specs.map((row) => `<dt>${escapeHtml(row.metric)}</dt><dd>${escapeHtml(row.value)}</dd>`).join("")}</dl>`
          : `<div class="empty">No matching spec rows found for ${escapeHtml(baseModel(`${product["Master SKU"]} ${product.Name}`) || "this unit")}.</div>`
      }
    </section>`;
}

function renderProductLookup(target = { select: els.unitSelect, search: els.unitSearch, details: els.unitDetails }) {
  renderUnitOptions(target);
  renderUnitDetails(target);
}

function cleanSpecValue(value) {
  const text = String(value ?? "").trim();
  if (!text || /^(n\/a|na|-|0|0\.0)$/i.test(text)) return "Not listed";
  return text;
}

function purifierProductRecord(product) {
  const rows = data.products || [];
  const preferred = String(product.preferredSku || "").toUpperCase();
  const model = String(product.specModel || product.preferredSku || product.name).toUpperCase().replace(".0", "");
  const candidates = rows
    .filter((row) => {
      const sku = String(row["Master SKU"] || "").toUpperCase();
      const name = String(row.Name || "").toUpperCase();
      if (preferred && sku === preferred) return true;
      return sku.startsWith(model) || name.includes(model);
    })
    .filter((row) => !/FILTER|REPLACEMENT|STAND|VALUE PACK|EXTRA FILTER/i.test(`${row["Master SKU"]} ${row.Name}`));

  return candidates
    .sort((a, b) => {
      const score = (row) => {
        const sku = String(row["Master SKU"] || "").toUpperCase();
        const name = String(row.Name || "").toUpperCase();
        let value = 0;
        if (sku === preferred) value -= 100;
        if (/AIR PURIFIER|UNIT|MEDIFY AIR/.test(name)) value -= 20;
        if (/\b(W1|B1|S1)$/.test(sku)) value -= 10;
        if (/2\s*-?\s*PACK|TWO\s*PACK/.test(name)) value += 50;
        return value;
      };
      return score(a) - score(b);
    })[0];
}

function purifierDimensions(product) {
  const row = purifierProductRecord(product);
  if (!row) return "Not listed";
  const height = cleanSpecValue(row["Height (in.)"]);
  const width = cleanSpecValue(row["Width (in.)"]);
  const length = cleanSpecValue(row["Length (in.)"]);
  if ([height, width, length].includes("Not listed")) return "Not listed";
  return `${height}" H x ${width}" W x ${length}" L`;
}

function purifierWeight(product) {
  const row = purifierProductRecord(product);
  if (!row) return "Not listed";
  const pounds = cleanSpecValue(row["Pounds..."]);
  const ounces = cleanSpecValue(row["...plus Ounces"]);
  if (pounds === "Not listed" && ounces === "Not listed") return "Not listed";
  return `${pounds === "Not listed" ? "0" : pounds} lb ${ounces === "Not listed" ? "0" : ounces} oz`;
}

function specValueForProduct(product, specRow) {
  if (!product.specModel || !specRow?.values) return "Not listed";
  return cleanSpecValue(specRow.values[product.specModel]);
}

function groupedTechnicalSpecRows(selected) {
  const groups = [
    { label: "Airflow (m3/h)", start: 1, end: 10 },
    { label: "Sound level", start: 11, end: 20 },
    { label: "Fan RPM", start: 21, end: 30 },
    { label: "Airflow (CFM)", start: 31, end: 35 },
  ];

  return groups.flatMap((group) =>
    (data.specs || [])
      .slice(group.start, group.end + 1)
      .map((row) => ({
        label: `${group.label} - ${row.metric}`,
        values: selected.map((product) => specValueForProduct(product, row)),
      }))
      .filter((row) => row.values.some((value) => value !== "Not listed")),
  );
}

function purifierById(id) {
  return purifierProducts.find((product) => product.id === id) || purifierProducts[0];
}

function renderPurifierSelects() {
  const selects = [els.purifierCompareOne, els.purifierCompareTwo, els.purifierCompareThree];
  selects.forEach((select, index) => {
    if (!select) return;
    const selected = select.value || purifierCompareDefaults[index] || purifierProducts[index]?.id;
    select.innerHTML = purifierProducts.map((product) => `<option value="${escapeHtml(product.id)}">${escapeHtml(product.name)}</option>`).join("");
    select.value = selected;
  });
}

function renderPurifierComparison() {
  if (!els.purifierComparisonTable) return;
  renderPurifierSelects();
  const selected = [els.purifierCompareOne, els.purifierCompareTwo, els.purifierCompareThree].map((select) => purifierById(select.value));
  const overviewRows = [
    ["Coverage", (product) => product.coverage],
    ["Best for", (product) => product.bestFor],
    ["Filter", (product) => product.filter],
    ["Verification", (product) => product.verification],
    ["Current price", (product) => product.price],
    ["Availability", (product) => product.availability],
    ["Variants / colors", (product) => product.variants],
    ["Features", (product) => product.features],
  ];
  const technicalRows = [
    ["Dimensions", (product) => product.dimensions],
    ["Weight", (product) => product.weight],
    ["Wattage", (product) => product.wattage],
    ["Fan speeds", (product) => product.fanSpeeds],
    ["Controls", (product) => product.controls],
    ["Warranty", (product) => product.warranty],
    ["On wheels", (product) => product.onWheels],
  ];
  const performanceRows = [
    ["Coverage by ACH", (product) => product.coverageArea],
    ["CADR by speed", (product) => product.cadrBySpeed],
    ["CADR by particle", (product) => product.cadrByParticle],
    ["Integrated Energy Factor (IEF)", (product) => product.ief],
    ["Annual energy consumption", (product) => product.annualEnergy],
    ["AHAM verified at", (product) => product.ahamVerifiedAt],
    ["Filter life", (product) => product.filterLife],
    ["Filter configuration", (product) => product.filterConfiguration],
    ["Sound level", (product) => product.soundLevel],
  ];
  const renderRows = (rows) =>
    rows
      .map(
        ([label, getValue]) => `
          <tr>
            <td>${escapeHtml(label)}</td>
            ${selected.map((product, index) => `<td>${escapeHtml(cleanSpecValue(getValue(product, index)))}</td>`).join("")}
          </tr>`,
      )
      .join("");
  const sectionRow = (label) => `
    <tr class="comparison-section-row">
      <td colspan="${selected.length + 1}">${escapeHtml(label)}</td>
    </tr>`;

  els.purifierComparisonTable.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Compare</th>
          ${selected.map((product) => `<th>${escapeHtml(product.name)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${sectionRow("Product Overview")}
        ${renderRows(overviewRows)}
        ${sectionRow("Technical Specifications")}
        ${renderRows(technicalRows)}
        ${sectionRow("Performance & Filtration")}
        ${renderRows(performanceRows)}
        <tr>
          <td>Product page</td>
          ${selected.map((product) => `<td><a href="${product.url}" target="_blank" rel="noreferrer">View on Medify Air</a></td>`).join("")}
        </tr>
        <tr>
          <td>Collection source</td>
          ${selected.map(() => `<td><a href="${purifierSourceUrl}" target="_blank" rel="noreferrer">Medify purifier collection</a></td>`).join("")}
        </tr>
      </tbody>
    </table>`;
}

function renderTools() {
  els.toolsCount.textContent = `${(data.formulas || []).length} formulas preserved`;
  renderReplacementTool();
  renderPurifierComparison();
  renderProductLookup();
  document.querySelectorAll(".tool-panel").forEach((panel) => panel.classList.remove("is-focused"));
  if (state.toolFocus === "replacement") {
    document.querySelector("#replacementToolPanel")?.classList.add("is-focused");
  }
  if (state.toolFocus === "purifierCompare") {
    document.querySelector("#purifierComparisonPanel")?.classList.add("is-focused");
  }
}


function faqSearchText(item) {
  return `${item.question || ""} ${item.answer || ""} ${item.callAnswer || ""} ${item.emailAnswer || ""} ${item.category || ""} ${item.keywords || ""} ${item.agentNote || ""}`;
}

function initFaqFilters() {
  if (!els.faqCategory) return;
  const categories = ["All categories", ...new Set(faqLibrary.map((item) => item.category).filter(Boolean))];
  els.faqCategory.innerHTML = categories.map((category) => `<option>${escapeHtml(category)}</option>`).join("");
  els.faqCategory.value = state.faqCategory;
  const popular = ["Discontinued", "Filter light", "Warranty", "Shipping", "Filter Club", "HSA/FSA", "MA-15", "MA-25"];
  if (els.faqChips) {
    els.faqChips.innerHTML = popular.map((label) => `<button class="chip" type="button" data-faq-keyword="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join("");
  }
}

function renderFaqs() {
  if (!els.faqList) return;
  const query = norm(state.faqQuery).trim();
  const filtered = faqLibrary
    .filter((item) => state.faqCategory === "All categories" || item.category === state.faqCategory)
    .map((item) => ({ ...item, score: query ? scoreText(faqSearchText(item), query) + scoreText(item.question, query) * 2 : (item.priority ? 10 : 1) }))
    .filter((item) => !query || item.score > 0)
    .sort((a, b) => query ? b.score - a.score || a.category.localeCompare(b.category) || a.question.localeCompare(b.question) : a.category.localeCompare(b.category) || Number(b.priority) - Number(a.priority) || a.question.localeCompare(b.question));

  if (els.faqCount) els.faqCount.textContent = `${filtered.length} of ${faqLibrary.length} questions`;
  if (!filtered.length) {
    els.faqList.innerHTML = `<div class="empty animated-empty"><strong>No FAQs found.</strong><br>Try a broader keyword such as filter, warranty, discontinued, shipping, or a model number.</div>`;
    return;
  }

  const groups = filtered.reduce((acc, item) => {
    const key = item.category || "General";
    (acc[key] ||= []).push(item);
    return acc;
  }, {});

  els.faqList.innerHTML = Object.entries(groups).map(([category, items]) => `
    <section class="faq-group">
      <div class="faq-group-heading">
        <h3>${escapeHtml(category)}</h3>
        <span>${items.length} ${items.length === 1 ? "question" : "questions"}</span>
      </div>
      <div class="faq-group-items">
        ${items.map((item) => `
          <details class="faq-card" ${query && items.indexOf(item) < 2 ? "open" : ""}>
            <summary>
              <span>${escapeHtml(item.question)}</span>
              ${item.priority ? '<span class="faq-common-badge">Common</span>' : ""}
            </summary>
            <div class="faq-answer">
              <div class="faq-response-grid">
                <section class="faq-response-panel faq-call-response">
                  <div class="faq-response-heading">
                    <span class="faq-response-type">Call response</span>
                    <small>Natural answer you can read aloud</small>
                  </div>
                  <p>${escapeHtml(item.callAnswer || item.answer)}</p>
                  <button class="primary-action" type="button" data-copy-text="${escapeHtml(item.callAnswer || item.answer)}" data-copy-label="Call response copied">Copy call response</button>
                </section>
                <section class="faq-response-panel faq-email-response">
                  <div class="faq-response-heading">
                    <span class="faq-response-type">Email response</span>
                    <small>Polished answer ready to paste</small>
                  </div>
                  <p>${escapeHtml(item.emailAnswer || item.answer)}</p>
                  <button class="primary-action" type="button" data-copy-text="${escapeHtml(item.emailAnswer || item.answer)}" data-copy-label="Email response copied">Copy email response</button>
                </section>
              </div>
              ${item.agentNote ? `<div class="faq-agent-note"><strong>Internal note:</strong> ${escapeHtml(item.agentNote)}</div>` : ""}
              ${item.sourceUrl ? `<div class="faq-actions"><a class="secondary-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.sourceLabel || "Open reference")}</a></div>` : ""}
            </div>
          </details>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderStats() {
  document.querySelector("#recordCount").textContent = allCannedResponses().length;
  els.kbCount.textContent = internalKb.pages.length;
  document.querySelector("#manualStatCount").textContent = medifyManuals.manuals.length;
  document.querySelector("#toolCount").textContent = (data.replacementCodes?.length || 0) + (data.formulas?.length || 0) + allTickets().length;
}

function renderCurrentView() {
  renderStats();
  if (state.view === "hub") renderHub();
  if (state.view === "canned") renderCannedResponses();
  if (state.view === "tickets") renderTicketLibrary();
  if (state.view === "ticketLinks") renderTicketLinks();
  if (state.view === "internalKb") renderInternalKb();
  if (state.view === "manuals") renderManuals();
  if (state.view === "faqs") renderFaqs();
  if (state.view === "tools") renderTools();
  if (state.view === "favorites") renderFavorites();
}

function updateWorkspaceMode() {
  const activeView = state.view || "hub";
  document.body.dataset.activeView = activeView;
  document.body.classList.toggle("focused-workspace", activeView !== "hub");
}

function sortStaticTemplateCards() {
  const getSortTitle = (card) => {
    const title = card.querySelector("h3, strong")?.textContent?.trim() || "";
    return title.toLowerCase();
  };

  const sortGrid = (selector) => {
    const grid = document.querySelector(selector);
    if (!grid) return;
    [...grid.children]
      .filter((card) => card.querySelector("h3, strong"))
      .sort((a, b) => getSortTitle(a).localeCompare(getSortTitle(b), undefined, { numeric: true }))
      .forEach((card) => grid.appendChild(card));
  };

  [
    ".l1-template-grid",
    "#ordersView .script-bank",
    "#filterClubView .script-bank",
    "#productInfoView .script-bank",
    "#purifierScriptView .script-bank",
    "#troubleshootingView .model-grid",
    "#toolsView .tool-grid"
  ].forEach(sortGrid);
}

function setView(view, toolFocus = "") {
  state.view = view;
  state.toolFocus = view === "tools" ? toolFocus : "";
  updateWorkspaceMode();
  document.querySelectorAll(".nav-item").forEach((button) => {
    const focus = button.dataset.toolFocus || "";
    const isActive = button.dataset.view === view && focus === state.toolFocus;
    button.classList.toggle("active", isActive);
  });
  document.querySelectorAll(".view").forEach((panel) => panel.classList.remove("active"));
  const activePanel = document.querySelector(`#${view}View`);
  activePanel?.classList.add("active");
  renderCurrentView();

  // Make every left-side tab jump to its page, not only the tool shortcut buttons.
  window.setTimeout(() => {
    const focusTargets = {
      replacement: "#replacementToolPanel",
      purifierCompare: "#purifierComparisonPanel",
    };
    const target = state.toolFocus ? document.querySelector(focusTargets[state.toolFocus]) : activePanel;
    (target || activePanel || document.querySelector(".workspace"))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);

  if (history.replaceState) {
    const hash = `#${view}${state.toolFocus ? `-${state.toolFocus}` : ""}`;
    history.replaceState(null, "", hash);
  }
}

function setInitialViewFromHash() {
  const hash = window.location.hash.replace("#", "");
  const directTools = {
    "tools-replacement": ["tools", "replacement"],
    "tools-purifierCompare": ["tools", "purifierCompare"],
  };
  if (directTools[hash]) {
    setView(directTools[hash][0], directTools[hash][1]);
    return true;
  }
  const view = hash.split("-")[0];
  if (["hub", "canned", "tickets", "ticketLinks", "voice", "l1chats", "orders", "filterClub", "troubleshooting", "productInfo", "purifierScript", "prompts", "manuals", "tools", "favorites", "internalKb", "faqs"].includes(view)) {
    setView(view);
    return true;
  }
  return false;
}

function initFilters() {
  const sheets = ["All sheets", ...new Set(data.records.filter((item) => !isHiddenRecord(item)).map((item) => item.sheet))];
  els.sheetFilter.innerHTML = sheets.map((sheet) => `<option>${escapeHtml(sheet)}</option>`).join("");
  updateSections();
}

function updateSections() {
  const visible = data.records.filter((item) => !isHiddenRecord(item));
  const pool = state.sheet === "All sheets" ? visible : visible.filter((item) => item.sheet === state.sheet);
  const sections = ["All sections", ...new Set(pool.map((item) => item.section).filter(Boolean))].sort((a, b) =>
    a === "All sections" ? -1 : b === "All sections" ? 1 : a.localeCompare(b),
  );
  els.sectionFilter.innerHTML = sections.map((section) => `<option>${escapeHtml(section)}</option>`).join("");
  if (!sections.includes(state.section)) state.section = "All sections";
  els.sectionFilter.value = state.section;
}


const CLICK_ANIMATION_SELECTOR = [
  "button",
  "a",
  ".chip",
  ".dashboard-card",
  ".note-template-card",
  ".manual-card",
  ".tool-card",
  ".ticket-card",
  ".card",
  "[data-view]",
  "[data-copy]",
  "[data-copy-text]",
  "[data-save]"
].join(", ");

function animateClick(event) {
  const target = event.target.closest(CLICK_ANIMATION_SELECTOR);
  if (!target) return;

  target.classList.remove("click-pop");
  void target.offsetWidth;
  target.classList.add("click-pop");
  window.setTimeout(() => target.classList.remove("click-pop"), 560);

  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height) * 1.35;
  ripple.className = "click-ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  const x = typeof event.clientX === "number" ? event.clientX : rect.left + rect.width / 2;
  const y = typeof event.clientY === "number" ? event.clientY : rect.top + rect.height / 2;
  ripple.style.left = `${x - rect.left - size / 2}px`;
  ripple.style.top = `${y - rect.top - size / 2}px`;
  target.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 720);
}

document.addEventListener("pointerdown", animateClick, { passive: true });

const navDropdowns = [...document.querySelectorAll(".nav-dropdown")];

function setNavDropdownState(dropdown, isOpen) {
  if (!dropdown) return;
  const trigger = dropdown.querySelector(".nav-dropdown-trigger");
  const panel = [...dropdown.children].find((child) =>
    child.classList.contains("nav-dropdown-menu") || child.classList.contains("focus-player"),
  );
  dropdown.classList.toggle("is-open", isOpen);
  trigger?.setAttribute("aria-expanded", String(isOpen));
  if (panel) panel.hidden = !isOpen;
}

navDropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector(".nav-dropdown-trigger");
  trigger?.addEventListener("click", () => {
    const shouldOpen = !dropdown.classList.contains("is-open");
    navDropdowns.forEach((otherDropdown) => {
      setNavDropdownState(otherDropdown, otherDropdown === dropdown && shouldOpen);
    });
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  navDropdowns.forEach((dropdown) => setNavDropdownState(dropdown, false));
});

restoreCompletedCopies();
new MutationObserver(() => restoreCompletedCopies()).observe(document.body, { childList: true, subtree: true });

document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-dropdown")) {
    navDropdowns.forEach((dropdown) => setNavDropdownState(dropdown, false));
  }

  const nav = event.target.closest("[data-view]");
  if (nav) {
    setView(nav.dataset.view, nav.dataset.toolFocus || "");
    setNavDropdownState(nav.closest(".nav-dropdown"), false);
    return;
  }

  const directCopy = event.target.closest("[data-copy-text]");
  if (directCopy) {
    copyText(directCopy.dataset.copyText || "", directCopy.dataset.copyLabel || "Copied to clipboard", directCopy);
  }

  const copy = event.target.closest("[data-copy]");
  if (copy) {
    const item = data.records.find((record) => record.id === copy.dataset.copy);
    if (item) copyText(item.body, "Response copied", copy);
  }

  const save = event.target.closest("[data-save]");
  if (save) toggleSaved(save.dataset.save);

  const cannedKeyword = event.target.closest("[data-canned-keyword]");
  if (cannedKeyword) {
    state.cannedQuery = cannedKeyword.dataset.cannedKeyword;
    els.cannedSearch.value = state.cannedQuery;
    document.querySelectorAll("[data-canned-keyword]").forEach((chip) => chip.classList.toggle("active", chip === cannedKeyword));
    renderCurrentView();
  }

  const ticketKeyword = event.target.closest("[data-ticket-library-keyword]");
  if (ticketKeyword) {
    state.ticketQuery = ticketKeyword.dataset.ticketLibraryKeyword;
    els.ticketLibrarySearch.value = state.ticketQuery;
    document.querySelectorAll("[data-ticket-library-keyword]").forEach((chip) => chip.classList.toggle("active", chip === ticketKeyword));
    renderCurrentView();
  }

  const kbKeyword = event.target.closest("[data-kb-keyword]");
  if (kbKeyword) {
    state.kbQuery = kbKeyword.dataset.kbKeyword;
    els.kbSearch.value = state.kbQuery;
    document.querySelectorAll("[data-kb-keyword]").forEach((chip) => chip.classList.toggle("active", chip === kbKeyword));
    renderCurrentView();
  }

  const ticketDetail = event.target.closest("[data-ticket-detail]");
  if (ticketDetail) openTicketDrawer(ticketDetail.dataset.ticketDetail);

  const kbDetail = event.target.closest("[data-kb-detail]");
  if (kbDetail) openKbDrawer(kbDetail.dataset.kbDetail);

  const quick = event.target.closest("[data-quick-search]");
  if (quick) {
    els.searchInput.value = quick.dataset.quickSearch;
    state.query = quick.dataset.quickSearch;
    setView("hub");
  }

  const internalKbLink = event.target.closest('a[href*="medify-air-internal-kb"]');
  if (internalKbLink) showToast("Opening Internal KB");
});

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderCurrentView();
});

els.manualSearch.addEventListener("input", renderCurrentView);

els.sheetFilter.addEventListener("change", (event) => {
  state.sheet = event.target.value;
  state.section = "All sections";
  updateSections();
  renderCurrentView();
});

els.sectionFilter.addEventListener("change", (event) => {
  state.section = event.target.value;
  renderCurrentView();
});

els.replacementReason.addEventListener("change", renderReplacementTool);
els.replacementOrder.addEventListener("input", renderReplacementTool);
els.copyGenerated.addEventListener("click", () => copyText(els.generatedCode.textContent, "Replacement code copied", els.copyGenerated));
els.cannedSearch.addEventListener("input", (event) => {
  state.cannedQuery = event.target.value;
  document.querySelectorAll("[data-canned-keyword]").forEach((chip) => chip.classList.remove("active"));
  renderCurrentView();
});
els.cannedCategory.addEventListener("change", (event) => {
  state.cannedCategory = event.target.value;
  renderCurrentView();
});
els.cannedModel.addEventListener("change", (event) => {
  state.cannedModel = event.target.value;
  renderCurrentView();
});
els.clearCannedFilters.addEventListener("click", () => {
  state.cannedQuery = "";
  state.cannedCategory = "All categories";
  state.cannedModel = "All models";
  els.cannedSearch.value = "";
  els.cannedCategory.value = state.cannedCategory;
  els.cannedModel.value = state.cannedModel;
  document.querySelectorAll("[data-canned-keyword]").forEach((chip) => chip.classList.remove("active"));
  showToast("Filters cleared");
  renderCurrentView();
});
els.ticketLibrarySearch.addEventListener("input", (event) => {
  state.ticketQuery = event.target.value;
  document.querySelectorAll("[data-ticket-library-keyword]").forEach((chip) => chip.classList.remove("active"));
  renderCurrentView();
});
els.ticketLibraryCategory.addEventListener("change", (event) => {
  state.ticketCategory = event.target.value;
  renderCurrentView();
});
els.ticketLibraryIssue.addEventListener("change", (event) => {
  state.ticketIssue = event.target.value;
  renderCurrentView();
});
els.ticketLibraryModel.addEventListener("change", (event) => {
  state.ticketModel = event.target.value;
  renderCurrentView();
});
els.ticketLibraryStatus.addEventListener("change", (event) => {
  state.ticketStatus = event.target.value;
  renderCurrentView();
});
els.ticketLibraryTag.addEventListener("change", (event) => {
  state.ticketTag = event.target.value;
  renderCurrentView();
});
els.ticketLinkSearch?.addEventListener("input", (event) => {
  state.ticketLinkQuery = event.target.value;
  renderTicketLinks();
});
els.clearTicketLinkSearch?.addEventListener("click", () => {
  state.ticketLinkQuery = "";
  if (els.ticketLinkSearch) els.ticketLinkSearch.value = "";
  renderTicketLinks();
  showToast("Ticket link search cleared");
});

els.clearTicketFilters.addEventListener("click", () => {
  state.ticketQuery = "";
  state.ticketCategory = "All categories";
  state.ticketIssue = "All issue types";
  state.ticketModel = "All models";
  state.ticketStatus = "All statuses";
  state.ticketTag = "All tags";
  els.ticketLibrarySearch.value = "";
  els.ticketLibraryCategory.value = state.ticketCategory;
  els.ticketLibraryIssue.value = state.ticketIssue;
  els.ticketLibraryModel.value = state.ticketModel;
  els.ticketLibraryStatus.value = state.ticketStatus;
  els.ticketLibraryTag.value = state.ticketTag;
  document.querySelectorAll("[data-ticket-library-keyword]").forEach((chip) => chip.classList.remove("active"));
  showToast("Filters cleared");
  renderCurrentView();
});
els.kbSearch.addEventListener("input", (event) => {
  state.kbQuery = event.target.value;
  document.querySelectorAll("[data-kb-keyword]").forEach((chip) => chip.classList.remove("active"));
  renderCurrentView();
});
els.kbCategorySelect.addEventListener("change", (event) => {
  state.kbCategory = event.target.value;
  renderCurrentView();
});
els.kbTagSelect.addEventListener("change", (event) => {
  state.kbTag = event.target.value;
  renderCurrentView();
});
els.clearKbFilters.addEventListener("click", () => {
  state.kbQuery = "";
  state.kbCategory = "All";
  state.kbTag = "All tags";
  els.kbSearch.value = "";
  els.kbCategorySelect.value = state.kbCategory;
  els.kbTagSelect.value = state.kbTag;
  document.querySelectorAll("[data-kb-keyword]").forEach((chip) => chip.classList.remove("active"));
  showToast("Filters cleared");
  renderCurrentView();
});
els.closeDetailDrawer.addEventListener("click", closeDetailDrawer);
els.ticketDrawerBackdrop.addEventListener("click", closeDetailDrawer);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.detailDrawer.classList.contains("open")) closeDetailDrawer();
});

els.faqSearch?.addEventListener("input", (event) => {
  state.faqQuery = event.target.value;
  renderFaqs();
});
els.faqCategory?.addEventListener("change", (event) => {
  state.faqCategory = event.target.value;
  renderFaqs();
});
els.clearFaqFilters?.addEventListener("click", () => {
  state.faqQuery = "";
  state.faqCategory = "All categories";
  if (els.faqSearch) els.faqSearch.value = "";
  if (els.faqCategory) els.faqCategory.value = "All categories";
  document.querySelectorAll("[data-faq-keyword]").forEach((chip) => chip.classList.remove("active"));
  renderFaqs();
  showToast("FAQ filters cleared");
});
document.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-faq-keyword]");
  if (!chip) return;
  state.faqQuery = chip.dataset.faqKeyword || "";
  if (els.faqSearch) els.faqSearch.value = state.faqQuery;
  document.querySelectorAll("[data-faq-keyword]").forEach((item) => item.classList.toggle("active", item === chip));
  renderFaqs();
});

els.unitSearch.addEventListener("input", () => {
  els.unitSelect.value = "0";
  renderCurrentView();
});
els.unitSelect.addEventListener("change", () =>
  renderUnitDetails({
    select: els.unitSelect,
    search: els.unitSearch,
    details: els.unitDetails,
  }),
);
[els.purifierCompareOne, els.purifierCompareTwo, els.purifierCompareThree].forEach((select) => {
  select.addEventListener("change", renderPurifierComparison);
});
els.musicPlay.addEventListener("click", toggleMusic);
els.musicPrev.addEventListener("click", () => stepMusic(-1));
els.musicNext.addEventListener("click", () => stepMusic(1));
els.musicMute.addEventListener("click", () => {
  state.musicMuted = !state.musicMuted;
  audio.muted = state.musicMuted;
  saveMusicPrefs();
  renderMusicPlayer();
  showToast(state.musicMuted ? "Focus music muted" : "Focus music unmuted");
});
els.musicVolume.addEventListener("input", (event) => {
  state.musicVolume = Number(event.target.value);
  audio.volume = state.musicVolume;
  saveMusicPrefs();
});
audio.addEventListener("ended", () => {
  const playlist = focusMusic.playlist || [];
  if (!playlist.length) return;
  state.musicIndex = (state.musicIndex + 1) % playlist.length;
  saveMusicPrefs();
  loadMusicTrack(true);
});
audio.addEventListener("error", () => {
  showToast("Music file failed to load");
  renderMusicPlayer();
});

if (els.sourceName) els.sourceName.textContent = `${data.source} + Internal KB`;
renderTicketNoteTemplates();
sortStaticTemplateCards();
initFilters();
initLibraryFilters();
initFaqFilters();
renderMusicPlayer();
updateWorkspaceMode();
if (!setInitialViewFromHash()) renderCurrentView();


// Cjei Bot floating search helper
(() => {
  const onReady = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  onReady(() => {
    const launcher = document.querySelector("#cjeiBotLauncher");
    const panel = document.querySelector("#cjeiBotPanel");
    const closeBtn = document.querySelector("#cjeiBotClose");
    const input = document.querySelector("#cjeiBotSearchInput");
    const go = document.querySelector("#cjeiBotSearchGo");
    const globalSearch = document.querySelector("#searchInput");

    if (!launcher || !panel || !input || !go || !globalSearch) return;

    const openPanel = () => {
      panel.hidden = false;
      window.setTimeout(() => input.focus(), 60);
    };

    const closePanel = () => {
      panel.hidden = true;
      launcher.focus();
    };

    const runSearch = (query) => {
      const value = String(query || input.value || "").trim();
      panel.hidden = true;
      const dashboardButton = document.querySelector('.nav-item[data-view="hub"]');
      if (dashboardButton) dashboardButton.click();
      globalSearch.value = value;
      globalSearch.dispatchEvent(new Event("input", { bubbles: true }));
      globalSearch.focus();
      document.querySelector(".workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof showToast === "function") {
        showToast(value ? `Searching for “${value}”` : "Search box is ready");
      }
    };

    launcher.addEventListener("click", () => {
      if (panel.hidden) openPanel();
      else closePanel();
    });

    closeBtn?.addEventListener("click", closePanel);
    go.addEventListener("click", () => runSearch());
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") runSearch();
      if (event.key === "Escape") closePanel();
    });

    document.querySelectorAll("[data-bot-query]").forEach((button) => {
      button.addEventListener("click", () => {
        input.value = button.dataset.botQuery || "";
        runSearch(input.value);
      });
    });
  });
})();

/* Cjei Work Hub v4 - one search cleanup */
function scoreText(haystack, query) {
  const q = norm(query).trim();
  if (!q) return 1;
  const text = norm(haystack).replace(/\s+/g, " ");
  const terms = splitTerms(q);
  let score = text.includes(q) ? 140 : 0;
  terms.forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordMatch = new RegExp(`\\b${escaped}\\b`, "i").test(text);
    if (wordMatch) score += 28;
    else if (text.includes(term)) score += 12;
  });
  return score;
}

function highlight(text) {
  const safe = escapeHtml(text);
  const terms = splitTerms(state.query).slice(0, 10);
  if (!terms.length) return safe;
  const escaped = [...new Set(terms)]
    .sort((a, b) => b.length - a.length)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!escaped.length) return safe;
  return safe.replace(new RegExp(`(${escaped.join("|")})`, "ig"), "<mark>$1</mark>");
}

function compactText(value, limit = 460) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
}

function universalScore(item, query) {
  const q = norm(query).trim();
  if (!q) return item.featured ? 10 : 1;
  const titleScore = scoreText(item.title, q) * 2.2;
  const tagScore = scoreText((item.tags || []).join(" "), q) * 1.4;
  const bodyScore = scoreText(`${item.sourceLabel} ${item.meta} ${item.excerpt} ${item.searchText || ""}`, q);
  return titleScore + tagScore + bodyScore;
}

function dedupeEntries(entries) {
  const seen = new Set();
  return entries.filter((item) => {
    const key = norm(`${item.sourceLabel}|${item.title}|${item.excerpt}`).replace(/\s+/g, " ").slice(0, 260);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function universalSearchIndex() {
  const entries = [];
  const add = (entry) => {
    entries.push({
      id: entry.id || `${entry.kind || "item"}-${entries.length}`,
      kind: entry.kind || "note",
      sourceLabel: entry.sourceLabel || "Result",
      title: entry.title || "Untitled",
      meta: entry.meta || "",
      excerpt: compactText(entry.excerpt || entry.searchText || ""),
      tags: (entry.tags || []).filter(Boolean).slice(0, 10),
      copyText: entry.copyText || "",
      detailId: entry.detailId || "",
      url: entry.url || "",
      urlLabel: entry.urlLabel || "Open source",
      secondaryUrl: entry.secondaryUrl || "",
      secondaryLabel: entry.secondaryLabel || "Open related link",
      searchText: entry.searchText || "",
      featured: Boolean(entry.featured),
      order: entry.order || entries.length,
    });
  };

  kbArticles().forEach((page) => add({
    id: page.id,
    kind: "kb",
    sourceLabel: "Internal KB",
    title: page.title,
    meta: page.category || page.originalCategory || "Knowledge base",
    excerpt: `${page.summary} ${(page.steps || []).slice(0, 4).join(" ")}`,
    tags: [page.category, page.productModel, ...(page.tags || [])],
    detailId: page.id,
    copyText: `${page.summary}\n\n${(page.steps || []).join("\n")}`,
    url: page.sourceUrl,
    urlLabel: "Original KB",
    searchText: kbSearchText(page),
    featured: /warranty|troubleshooting|shipping|refund|replacement/i.test(`${page.title} ${page.summary}`),
  }));

  ticketNoteTemplates.forEach((template, index) => add({
    id: template.id,
    kind: "note",
    sourceLabel: "Ticket Note Template",
    title: template.title,
    meta: "Quick copy internal note",
    excerpt: `${template.description} ${template.text}`,
    tags: template.tags,
    copyText: template.text,
    searchText: `${template.title} ${template.description} ${template.text} ${(template.tags || []).join(" ")} ticket notes template internal note`,
    featured: /replacement|voice|return|cancellation/i.test(template.title),
    order: index,
  }));

  allTickets().forEach((ticket) => add({
    id: ticket.id,
    kind: "ticket",
    sourceLabel: "Ticket",
    title: ticket.title,
    meta: ticket.category || ticket.issueType || "Ticket library",
    excerpt: ticket.summary || ticket.notes || ticket.response || "Ticket reference",
    tags: [ticket.productModel, ticket.status, ticket.issueType, ...(ticket.tags || [])],
    detailId: ticket.id,
    copyText: ticket.notes || ticket.response || ticket.summary || "",
    url: ticket.url || "",
    urlLabel: "Open ticket",
    searchText: `${ticketSearchText(ticket)} ${ticket.url || ""} ticket link open ticket`,
  }));

  allCannedResponses().forEach((response) => add({
    id: response.id,
    kind: "script",
    sourceLabel: "Script",
    title: response.title,
    meta: response.category || response.useCase || "Canned response",
    excerpt: response.responseText,
    tags: [response.productModel, response.category, ...(response.tags || [])],
    copyText: response.responseText,
    searchText: responseSearchText(response),
    featured: /warranty|return|refund|subscription|cancel|replacement|shipping/i.test(`${response.title} ${response.responseText}`),
  }));


  faqLibrary.forEach((item) => add({
    id: item.id,
    kind: "faq",
    sourceLabel: "FAQ",
    title: item.question,
    meta: item.category || "Frequently Asked Questions",
    excerpt: item.answer,
    tags: [item.category, ...(String(item.keywords || "").split(/[,;|]/).map((tag) => tag.trim()).filter(Boolean))],
    copyText: item.answer,
    url: item.sourceUrl,
    urlLabel: item.sourceLabel || "Open reference",
    searchText: faqSearchText(item),
    featured: Boolean(item.priority),
  }));

  (medifyManuals.manuals || []).forEach((manual) => add({
    id: manual.id || manual.model || manual.title,
    kind: "manual",
    sourceLabel: "Manual",
    title: manual.title,
    meta: manual.model || "Product document",
    excerpt: (manual.bullets || []).join(" "),
    tags: [manual.model, "manual", "warranty"],
    url: manual.manualUrl,
    urlLabel: "Open manual",
    secondaryUrl: manual.productUrl,
    secondaryLabel: "Product page",
    searchText: `${manual.title} ${manual.model} ${(manual.bullets || []).join(" ")}`,
  }));

  (medifyManuals.warrantySummary || []).forEach((line, index) => add({
    id: `warranty-${index}`,
    kind: "warranty",
    sourceLabel: "Warranty",
    title: `Warranty note ${index + 1}`,
    meta: "Manuals & Warranty",
    excerpt: line,
    tags: ["warranty", "registration", "proof of purchase"],
    copyText: line,
    searchText: line,
  }));

  purifierProducts.forEach((product) => add({
    id: product.id,
    kind: "product",
    sourceLabel: "Purifier Specs",
    title: product.name,
    meta: product.specModel || product.preferredSku || "Product",
    excerpt: `${product.coverage}. Best for ${product.bestFor}. Filter: ${product.filter}. Features: ${product.features}. Price: ${product.price}.`,
    tags: [product.specModel, product.filter, product.verification, product.preferredSku],
    url: purifierSourceUrl,
    urlLabel: "Open product collection",
    searchText: `${product.name} ${product.specModel} ${product.preferredSku} ${product.coverage} ${product.bestFor} ${product.filter} ${product.verification} ${product.price} ${product.variants} ${product.features}`,
    featured: ["ma-25", "ma-40", "ma-50-v3"].includes(product.id),
  }));

  (data.products || []).forEach((product, index) => add({
    id: `sheet-product-${index}`,
    kind: "product-row",
    sourceLabel: "Product Sheet",
    title: product.Name || product["Master SKU"] || "Product row",
    meta: product["Master SKU"] || product.Brand || "Product data",
    excerpt: `Active: ${product.Active || "Unknown"}. Dimensions: ${product["Height (in.)"] || "?"} H x ${product["Width (in.)"] || "?"} W x ${product["Length (in.)"] || "?"} L. ${product.Description || ""}`,
    tags: [product.Brand, product.Active, product["Master SKU"]],
    copyText: `${product["Master SKU"] || ""} ${product.Name || ""}`.trim(),
    searchText: Object.values(product).join(" "),
  }));

  (data.replacementCodes || []).forEach((code, index) => add({
    id: `replacement-${index}`,
    kind: "replacement",
    sourceLabel: "Replacement Code",
    title: code.description || code.generatedCode || "Replacement code",
    meta: `${code.category || "Replacement"} ${code.reasonCode || ""}`.trim(),
    excerpt: code.generatedCode || `${code.category || ""} | ${code.reasonCode || ""}`,
    tags: [code.category, code.reasonCode, "replacement code"],
    copyText: code.generatedCode,
    searchText: `${code.category} ${code.reasonCode} ${code.description} ${code.generatedCode}`,
  }));

  (data.formulas || []).slice(0, 120).forEach((formula, index) => add({
    id: `formula-${index}`,
    kind: "formula",
    sourceLabel: "Sheet Formula",
    title: formula.value || formula.cell || "Formula helper",
    meta: `${formula.sheet || "Sheet"} ${formula.cell || ""}`.trim(),
    excerpt: formula.formula,
    tags: [formula.sheet, formula.cell, "formula"],
    copyText: formula.formula,
    searchText: `${formula.sheet} ${formula.cell} ${formula.value} ${formula.formula}`,
  }));


  [
    {
      id: "chatgpt-accuracy-prompt",
      kind: "prompt",
      sourceLabel: "ChatGPT Prompt",
      title: "Accuracy Double-Check Mode",
      meta: "Copy-ready prompt",
      excerpt: "Use this when you want ChatGPT to double-check, stay skeptical, research when needed, and be honest about uncertainty.",
      tags: ["ChatGPT", "accuracy", "double check", "research", "skeptical"],
      copyText: "You are an expert who double-checks things. Be skeptical, but do your research. I'm not always right, but neither are you. We both strive for accuracy.\n\nWhen you answer:\n- Verify assumptions before agreeing.\n- Tell me when you are unsure.\n- Correct me respectfully if my understanding seems wrong.\n- Use current and reliable sources when facts may have changed.\n- Separate facts from guesses or opinions.\n- Give the most accurate answer, not just the answer I seem to want.",
      searchText: "ChatGPT prompt accuracy double check skeptical research unsure verify assumptions",
      featured: true,
      order: 2,
    },
    {
      id: "chatgpt-chat-reply-prompt",
      kind: "prompt",
      sourceLabel: "ChatGPT Prompt",
      title: "Chat Reply Generator",
      meta: "Copy-ready prompt",
      excerpt: "Use this when you need a clean, friendly, professional ready-to-send chat response from rough notes.",
      tags: ["ChatGPT", "chat reply", "customer response", "copy paste"],
      copyText: "Help me create a chat response I can copy and send.\n\nUse my rough notes below, fix typos, and turn them into a clear, friendly, professional chat reply. Keep it natural and concise, not robotic.\n\nRules:\n- Acknowledge the customer's concern.\n- Explain the answer clearly.\n- Include next steps if needed.\n- Do not invent policies, discounts, links, order details, or technical info.\n- If something important is missing, write a safe reply asking for the needed information.\n- Output the ready-to-send chat message only.\n\nCustomer message / my notes:\n[paste the chat or details here]",
      searchText: "ChatGPT prompt chat reply customer response ready to send copy paste professional concise",
      featured: true,
      order: 3,
    },

    {
      id: "chatgpt-email-response-prompt",
      kind: "prompt",
      sourceLabel: "ChatGPT Prompt",
      title: "Email Response Generator",
      meta: "Copy-ready prompt",
      excerpt: "Use this when you need a clean, friendly, professional ready-to-send email response from rough notes.",
      tags: ["ChatGPT", "email reply", "customer email", "copy paste", "Medify"],
      copyText: "Help me create an email response I can copy and send.\n\nUse my rough notes below, fix typos, and turn them into a clear, friendly, professional customer email. Keep it natural, helpful, and not robotic.\n\nRules:\n- Start by acknowledging the customer's concern or request.\n- Explain the answer clearly and politely.\n- Include next steps, links, or instructions if I provided them.\n- Do not invent policies, discounts, links, order details, tracking, warranty decisions, or technical information.\n- Preserve any order number, email address, tracking number, product model, dates, and links I provide.\n- If something important is missing, write a safe email asking for the needed information.\n- Do not add a subject line unless I ask for one.\n- Output the ready-to-send email body only.\n\nCustomer message / my notes:\n[paste the customer email and my rough notes here]",
      searchText: "ChatGPT prompt email response customer email ready to send copy paste professional Medify",
      featured: true,
      order: 4,
    },
  ].forEach(add);

  return dedupeEntries(entries);
}

function hubItems() {
  const q = state.query || "";
  const items = universalSearchIndex()
    .map((item) => ({ ...item, score: universalScore(item, q) }))
    .filter((item) => q.trim() ? item.score > 0 : item.featured)
    .sort((a, b) => (q.trim() ? b.score - a.score || a.sourceLabel.localeCompare(b.sourceLabel) || a.title.localeCompare(b.title) : b.score - a.score || a.order - b.order));
  return items.slice(0, q.trim() ? 140 : 30);
}

function renderKnowledgeCards(items, target) {
  if (!items.length) {
    const q = state.query.trim();
    target.innerHTML = `<div class="empty animated-empty"><strong>No results found${q ? ` for “${escapeHtml(q)}”` : ""}.</strong><br>Try a broader keyword like a model number, issue type, order flow, warranty, refund, shipping, filter, or Recharge.</div>`;
    return;
  }

  const q = state.query.trim();
  const groups = items.reduce((acc, item) => {
    const key = item.sourceLabel || "Results";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  target.innerHTML = Object.entries(groups).map(([source, group]) => `
    <section class="result-group" aria-label="${escapeHtml(source)} results">
      <div class="result-group-title">
        <strong>${escapeHtml(source)}</strong>
        <span>${group.length} ${group.length === 1 ? "match" : "matches"}</span>
      </div>
      <div class="result-group-grid">
        ${group.map((item) => `
          <article class="knowledge-card unified-card">
            <div class="knowledge-top">
              <span class="source-badge">${escapeHtml(item.sourceLabel)}</span>
              <span>${escapeHtml(item.meta)}</span>
            </div>
            <h3>${highlight(item.title)}</h3>
            <p>${highlight(item.excerpt)}</p>
            ${(item.tags || []).length ? `<div class="tag-row">${item.tags.slice(0, 6).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
            <div class="knowledge-actions">
              ${item.kind === "ticket" && item.detailId ? `<button class="primary-action" type="button" data-ticket-detail="${escapeHtml(item.detailId)}">View details</button>` : ""}
              ${item.kind === "kb" && item.detailId ? `<button class="primary-action" type="button" data-kb-detail="${escapeHtml(item.detailId)}">View KB article</button>` : ""}
              ${item.copyText ? `<button class="secondary-action" type="button" data-copy-text="${escapeHtml(item.copyText)}" data-copy-label="Copied">Copy</button>` : ""}
              ${item.kind === "script" ? `<button class="secondary-action" type="button" data-save="${escapeHtml(item.id)}">${state.saved.has(item.id) ? "Saved" : "Save"}</button>` : ""}
              ${item.url ? `<a class="secondary-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.urlLabel)}</a>` : ""}
              ${item.secondaryUrl ? `<a class="secondary-link" href="${escapeHtml(item.secondaryUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.secondaryLabel)}</a>` : ""}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `).join("");
}

function renderHub() {
  const items = hubItems();
  const q = state.query.trim();
  els.hubCount.textContent = q ? `${items.length} organized matches` : "recommended resources";
  renderKnowledgeCards(items, els.hubResults);
}

function syncUnifiedSearch(value) {
  state.query = String(value || "");
  state.sheet = "All sheets";
  state.section = "All sections";
  if (els.sheetFilter) els.sheetFilter.value = state.sheet;
  if (els.sectionFilter) els.sectionFilter.value = state.section;
  if (state.view !== "hub") setView("hub");
  else renderCurrentView();
}

(() => {
  const onReady = (callback) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback, { once: true });
    else callback();
  };

  onReady(() => {
    const input = document.querySelector("#searchInput");
    const botInput = document.querySelector("#cjeiBotSearchInput");
    const botGo = document.querySelector("#cjeiBotSearchGo");
    if (input) {
      input.addEventListener("input", (event) => syncUnifiedSearch(event.target.value));
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") syncUnifiedSearch(input.value);
      });
    }
    if (botGo && botInput && input) {
      botGo.addEventListener("click", () => {
        input.value = botInput.value;
        syncUnifiedSearch(botInput.value);
        document.querySelector("#cjeiBotPanel")?.setAttribute("hidden", "");
        document.querySelector("#hubResults")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      botInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          input.value = botInput.value;
          syncUnifiedSearch(botInput.value);
          document.querySelector("#cjeiBotPanel")?.setAttribute("hidden", "");
          document.querySelector("#hubResults")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  });
})();

// Restored YouTube playlist save/open helper + real playlist track controls
(() => {
  const keys = ["cjeiYoutubePlaylistUrl", "wagmiYoutubePlaylistUrl", "cjeiWorkHubYoutubePlaylist"];
  const trackKeys = ["cjeiYoutubePlaylistTrack", "wagmiYoutubePlaylistTrack", "cjeiWorkHubYoutubeTrack"];
  const input = document.querySelector("#playlistUrlInput");
  const saveBtn = document.querySelector("#savePlaylistBtn");
  const clearBtn = document.querySelector("#clearPlaylistBtn");
  const playerMount = document.querySelector("#youtubePlaylistFrame");
  const wrap = document.querySelector("#youtubePlayerWrap");
  const empty = document.querySelector("#youtubeEmpty");
  const actions = document.querySelector("#youtubeActions");
  const openLink = document.querySelector("#openPlaylistLink");
  const copyBtn = document.querySelector("#copyPlaylistLinkBtn");
  const controls = document.querySelector("#youtubeControls");
  const prevBtn = document.querySelector("#youtubePrevBtn");
  const nextBtn = document.querySelector("#youtubeNextBtn");
  const trackInput = document.querySelector("#youtubeTrackNumber");
  const loadTrackBtn = document.querySelector("#youtubeLoadTrackBtn");

  if (!input || !saveBtn || !clearBtn || !playerMount || !wrap || !empty || !actions || !openLink || !copyBtn || !controls || !prevBtn || !nextBtn || !trackInput || !loadTrackBtn) return;

  const safeGet = (key) => {
    try { return localStorage.getItem(key) || ""; }
    catch { return ""; }
  };

  const safeSet = (url) => {
    try { keys.forEach((key) => localStorage.setItem(key, url)); }
    catch { /* local storage may be unavailable in strict browser modes */ }
  };

  const safeSetTrack = (trackNumber) => {
    try { trackKeys.forEach((key) => localStorage.setItem(key, String(trackNumber))); }
    catch { /* local storage may be unavailable in strict browser modes */ }
  };

  const safeRemove = () => {
    try {
      keys.forEach((key) => localStorage.removeItem(key));
      trackKeys.forEach((key) => localStorage.removeItem(key));
    }
    catch { /* local storage may be unavailable in strict browser modes */ }
  };

  const savedUrl = () => keys.map(safeGet).find(Boolean) || "";

  const getSavedTrack = () => {
    const stored = trackKeys.map(safeGet).find(Boolean) || "1";
    const number = Number.parseInt(stored, 10);
    return Number.isFinite(number) && number > 0 ? number : 1;
  };

  const normalizeTrackNumber = (value) => {
    const number = Number.parseInt(String(value || "1"), 10);
    return Number.isFinite(number) && number > 0 ? number : 1;
  };

  let activePlaylist = null;
  let activeTrack = getSavedTrack();
  let player = null;
  let playerReady = false;
  let pendingLoad = null;
  const apiCallbacks = [];

  const parsePlaylist = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;

    try {
      const url = new URL(raw);
      const list = url.searchParams.get("list");
      const index = normalizeTrackNumber(url.searchParams.get("index") || 1);
      if (list) {
        return {
          id: list,
          startingTrack: index,
          url: `https://www.youtube.com/playlist?list=${encodeURIComponent(list)}`,
        };
      }
    } catch {
      // Fall through to regex parsing for pasted partial links.
    }

    const match = raw.match(/[?&]list=([^&#\s]+)/i) || raw.match(/(?:playlist\?list=|list=)([^&#\s]+)/i);
    if (!match) return null;
    const id = decodeURIComponent(match[1]).trim();
    if (!id) return null;
    return {
      id,
      startingTrack: 1,
      url: `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`,
    };
  };

  const playlistUrlWithTrack = (playlistUrl, trackNumber = activeTrack) => {
    const safeTrack = normalizeTrackNumber(trackNumber);
    return `${playlistUrl}&playnext=1&index=${safeTrack}`;
  };

  const loadYouTubeApi = (callback) => {
    if (window.YT && typeof window.YT.Player === "function") {
      callback();
      return;
    }

    apiCallbacks.push(callback);
    if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === "function") previousReady();
      while (apiCallbacks.length) {
        const next = apiCallbacks.shift();
        try { next(); }
        catch (error) { console.warn("YouTube callback failed", error); }
      }
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  };

  const createPlayer = (callback) => {
    loadYouTubeApi(() => {
      if (player) {
        callback();
        return;
      }

      player = new window.YT.Player("youtubePlaylistFrame", {
        width: "100%",
        height: "190",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: (location.protocol === "http:" || location.protocol === "https:") ? location.origin : undefined,
        },
        events: {
          onReady: () => {
            playerReady = true;
            if (pendingLoad) {
              const load = pendingLoad;
              pendingLoad = null;
              runPlaylistLoad(load.trackNumber, load.autoplay);
            }
          },
        },
      });

      callback();
    });
  };

  const runPlaylistLoad = (trackNumber, autoplay = false) => {
    if (!activePlaylist || !player || !playerReady) {
      pendingLoad = { trackNumber, autoplay };
      return;
    }

    const safeTrack = normalizeTrackNumber(trackNumber);
    const zeroBasedIndex = Math.max(0, safeTrack - 1);
    const playlistOptions = {
      listType: "playlist",
      list: activePlaylist.id,
      index: zeroBasedIndex,
      startSeconds: 0,
    };

    try {
      if (autoplay && typeof player.loadPlaylist === "function") {
        player.loadPlaylist(playlistOptions);
      } else if (typeof player.cuePlaylist === "function") {
        player.cuePlaylist(playlistOptions);
      } else if (typeof player.loadPlaylist === "function") {
        player.loadPlaylist(playlistOptions);
      }

      // Force the selected playlist position after YouTube finishes loading the list.
      // This fixes the old bug where Prev/Next kept replaying the same video.
      window.setTimeout(() => {
        try {
          if (typeof player.playVideoAt === "function") player.playVideoAt(zeroBasedIndex);
          if (autoplay && typeof player.playVideo === "function") player.playVideo();
        } catch (error) {
          console.warn("YouTube track jump failed", error);
        }
      }, autoplay ? 450 : 700);
    } catch (error) {
      console.warn("YouTube playlist load failed", error);
    }
  };

  const renderFrame = (autoplay = false) => {
    if (!activePlaylist) return;
    trackInput.value = String(activeTrack);
    openLink.href = playlistUrlWithTrack(activePlaylist.url, activeTrack);
    openLink.dataset.playlistUrl = playlistUrlWithTrack(activePlaylist.url, activeTrack);
    copyBtn.dataset.playlistUrl = playlistUrlWithTrack(activePlaylist.url, activeTrack);
    createPlayer(() => runPlaylistLoad(activeTrack, autoplay));
  };

  const render = (url, options = {}) => {
    const parsed = parsePlaylist(url);
    input.value = url || "";

    if (!parsed) {
      activePlaylist = null;
      activeTrack = 1;
      if (player && typeof player.stopVideo === "function") {
        try { player.stopVideo(); } catch { /* ignore */ }
      }
      wrap.classList.remove("has-playlist");
      actions.hidden = true;
      controls.hidden = true;
      openLink.href = "#";
      delete openLink.dataset.playlistUrl;
      delete copyBtn.dataset.playlistUrl;
      trackInput.value = "1";
      empty.textContent = "Add your playlist link to save it here.";
      return;
    }

    activePlaylist = parsed;
    activeTrack = normalizeTrackNumber(options.trackNumber || parsed.startingTrack || activeTrack || 1);
    wrap.classList.add("has-playlist");
    actions.hidden = false;
    controls.hidden = false;
    renderFrame(Boolean(options.autoplay));
  };

  const save = () => {
    const parsed = parsePlaylist(input.value);
    if (!parsed) {
      showToast("Please paste a valid YouTube playlist link");
      input.focus();
      return;
    }
    activeTrack = parsed.startingTrack || 1;
    safeSet(parsed.url);
    safeSetTrack(activeTrack);
    render(parsed.url, { trackNumber: activeTrack });
    showToast("YouTube playlist saved");
  };

  const jumpToTrack = (trackNumber, autoplay = true) => {
    if (!activePlaylist) {
      showToast("Save your YouTube playlist first");
      input.focus();
      return;
    }
    activeTrack = normalizeTrackNumber(trackNumber);
    safeSetTrack(activeTrack);
    renderFrame(autoplay);
    showToast(`Playing playlist track #${activeTrack}`);
  };

  saveBtn.addEventListener("click", save);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") save();
  });

  clearBtn.addEventListener("click", () => {
    safeRemove();
    render("");
    showToast("Playlist cleared");
  });

  copyBtn.addEventListener("click", () => {
    const url = copyBtn.dataset.playlistUrl || openLink.href;
    copyText(url, "Playlist link copied", copyBtn);
  });

  prevBtn.addEventListener("click", () => {
    jumpToTrack(Math.max(1, activeTrack - 1), true);
  });

  nextBtn.addEventListener("click", () => {
    jumpToTrack(activeTrack + 1, true);
  });

  loadTrackBtn.addEventListener("click", () => {
    jumpToTrack(trackInput.value, true);
  });

  trackInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") jumpToTrack(trackInput.value, true);
  });

  trackInput.addEventListener("change", () => {
    const cleaned = normalizeTrackNumber(trackInput.value);
    trackInput.value = String(cleaned);
    safeSetTrack(cleaned);
  });

  render(savedUrl(), { trackNumber: getSavedTrack() });
})();

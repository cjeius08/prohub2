# Support Process Guides — Replacement Inventory

Branch: `support-process-guides-preview`

## Existing feature being replaced

The previous Guided Process Navigator was isolated to:

- `guided_processes.js`
- `guided_processes.css`
- the `#guidedProcessApp` mount inside `#processesView`
- one render hook in `app.js`
- the Guided Processes labels in the Case Tabs menu, Dashboard card, and Orders shortcut
- four Navigator-specific automated test files

The old JavaScript and CSS modules and their obsolete tests are removed on this branch. Historical inventories, policy-conflict notes, and prior screenshots remain in the repository as review records; they are not loaded by the website.

## Approved replacement sources

The following approved standalone prototypes are copied without workflow-content changes into `support-processes/`:

- `warranty-guided-process.html`
- `lost-damaged-claim-process.html`
- `returns-process.html`

They remain the source of truth for branching, validation, customer responses, status handling, and ending scenarios.

## Integration files

- `support_processes.js` loads the three approved prototypes, preserves each process state while switching, provides accessible tabs, and keeps the existing website router hook.
- `support_processes.css` supplies the shared site-compatible visual system and scopes all workflow controls to the process area.
- `dashboard_contrast.css` loads after all legacy theme layers and corrects the Dashboard’s low-contrast semantic text colors.
- `index.html` contains the new Support Process Guides selector and three process panels.
- `app.js` calls the new `SupportProcessGuides` render hook.

## Preserved website content

No unrelated view, search source, response template, ticket field, product information, troubleshooting article, link, media asset, or existing support page is removed or rewritten. The existing Orders page remains intact apart from its shortcut label pointing to the replacement process guides.

## Runtime boundary

The workflows are internal decision guides only. They do not connect to Shopify, UPS, payment systems, refunds, claims, or replacement-order APIs. Agents must still complete and verify those actions in the authorized operational systems.

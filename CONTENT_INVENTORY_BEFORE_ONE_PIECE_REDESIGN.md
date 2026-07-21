# Cjei Work Hub Content Inventory

Inventory captured before the One Piece-inspired navigation and visual redesign.

## Preservation rule

- Visual, layout, navigation, and usability changes only.
- Preserve all existing wording, scripts, product details, links, ticket fields, templates, datasets, search behavior, local-storage behavior, and tools.
- Keep the YouTube playlist usable and saved in the browser.
- Keep deep links such as `#ticketLinks` working.
- Keep the current source files and Git history as the rollback point.

## Primary application files

| File | Purpose | Baseline size |
| --- | --- | ---: |
| `index.html` | Page structure and all static workflow content | 1,637 lines |
| `styles.css` | Complete visual and responsive styling | 4,614 lines |
| `app.js` | Navigation, search, copy, filtering, ticket links, tools, music, and playlist behavior | 2,989 lines |
| `data.js` | Spreadsheet-derived scripts, products, ticket rows, links, codes, and formulas | 12,399 lines |
| `support_library.js` | Help Scout reference tickets and canned responses | 2,716 lines |
| `faq_data.js` | Customer questions, call answers, email answers, and agent notes | 1,081 lines |
| `internal_kb.js` | Indexed Medify Air internal-KB references | 242 lines |
| `medify_manuals.js` | Manuals and warranty references | 176 lines |
| `focus_music.js` | Focus-music playlist metadata | Preserved |

## Navigation and views

1. Dashboard (`hub`)
2. Email Responses (`canned`)
3. L1 Chats (`l1chats`)
4. Ticket Notes (`tickets`)
5. Ticket Links (`ticketLinks`)
6. Voice Calls (`voice`)
7. Filter Club (`filterClub`)
8. Orders & Returns (`orders`)
9. Product Info (`productInfo`)
10. Purifier Scripts (`purifierScript`)
11. Troubleshooting (`troubleshooting`)
12. ChatGPT Prompts (`prompts`)
13. FAQs (`faqs`)
14. Internal KB (`internalKb`)
15. Manuals & Warranty (`manuals`)
16. Sheet Tools (`tools`), including Purifier Compare and Replacement Code Generator
17. Saved Scripts (`favorites`)

The redesign may group these destinations under dropdown menus, but none may be removed.

## Data counts

| Content | Baseline count |
| --- | ---: |
| Workbook sheets | 25 |
| Searchable workbook records | 551 |
| Help Scout/reference tickets | 153 |
| Canned responses | 14 |
| FAQs | 83 |
| Internal-KB pages | 17 |
| Product manuals | 14 |
| Warranty summary points | 6 |
| Focus-music tracks | 10 |

## Interactive features to preserve

- One Search with sheet and section filters
- Single-word and closest-match searchable content behavior
- Direct URL/hash navigation, including `#ticketLinks`
- Dashboard shortcuts and all `data-view` navigation targets
- Ticket Link search and Help Scout link opening
- Ticket Note templates and copy actions
- Email, chat, and voice-call workflow pages
- Saved scripts/favorites stored in local storage
- Completed-copy state stored in local storage
- Copy-to-clipboard actions and toast feedback
- Manuals, warranty, FAQ, internal-KB, product, and ticket filtering
- Replacement-code generator
- Air-purifier comparison and product-specification tools
- Focus-music player, volume, mute, previous, and next controls
- YouTube playlist save, clear, copy, open, previous, next, and selected-track controls
- Responsive desktop/mobile behavior and accessible labels

## Assets and supporting files

- All existing logos, backgrounds, screenshots, audio files, scripts, server files, spreadsheets, and auxiliary directories remain untouched unless a direct path update is required by the visual redesign.

## Baseline validation notes

- `verify_manuals.mjs`: passes with 14 manuals, 13 images, 13 PDFs, and 6 warranty points.
- `duplicate_check.mjs`: reports 0 canned-response duplicates, 9 ticket-title duplicates, 0 ticket-note duplicates, and 0 internal-KB duplicates.
- `verify_data.mjs`: fails on the current baseline because it expects a removed `inventory` collection; this predates the redesign and is not caused by it.


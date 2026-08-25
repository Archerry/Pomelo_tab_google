# Pomelo Tab Chrome Web Store release kit design

Date: 2026-08-25

## Goal

Prepare a complete, internally consistent Chrome Web Store submission kit for Pomelo Tab so the publisher can upload a compliant extension package, copy each required field into the Developer Dashboard, host the privacy policy, and submit for review without having to invent missing content or resize assets manually.

## Language strategy

English is the default store language because the product interface is currently English. A complete Simplified Chinese localization is provided alongside it. The English and Chinese versions communicate the same capabilities and privacy behavior; neither version makes claims that are absent from the extension.

## Deliverable structure

All submission-only materials live under `release/store-listing/` and are excluded from the extension package.

- `assets/screenshots/`: four full-bleed `1280 × 800px` PNG screenshots.
- `assets/promo/`: one required `440 × 280px` small promotional tile and one optional `1400 × 560px` marquee tile.
- `assets/icon-128.png`: a copy of the approved store icon for convenient upload.
- `listing-en.md` and `listing-zh-CN.md`: field-ready store names, summaries, detailed descriptions, categories, and support text.
- `privacy-answers.md`: single-purpose statement, permission justifications, remote-code answer, data-category selections, data-use certifications, and distribution recommendations.
- `privacy-policy.md` and `privacy-policy.html`: matching policies ready for review and public hosting.
- `submission-checklist.md`: ordered dashboard workflow with filenames and exact field mappings.

The existing uploadable extension archive remains `release/pomelo-tab-v1.0.0.zip`.

## Screenshot set

Screenshots use the real Pomelo Tab UI in light theme and contain no mock functionality.

1. **Privacy-first onboarding:** the first-run disclosure and explicit `Enable Pomelo Tab` action.
2. **Daily workspace:** Open Tabs selected, showing the Pomelo identity, search, Quick Access, and grouped open tabs.
3. **Local library:** Bookmarks or History selected, demonstrating domain grouping and favicon presentation.
4. **Private insights:** Insights selected, showing the period selector, readable typography, and local usage bars.

Each screenshot is captured or composed from the running product at the official `1280 × 800px` store ratio. It is full bleed, has square image corners, and does not add explanatory text over the product UI.

## Promotional assets

The small and marquee tiles use the approved violet citrus-slice mark, the orange-violet Pomelo gradient, and restrained product copy.

- Small tile: mark, `Pomelo Tab`, and the short line `Your browser workspace, at a glance.`
- Marquee tile: mark and wordmark on the left, a cropped real product surface on the right, and the short line `Tabs, bookmarks, history and insights — in one calm new tab.`

The promotional graphics avoid admin-dashboard ornament, fake ratings, Chrome branding, fruit illustrations, and claims such as “best” or “number one.”

## Store listing content

The listing positions Pomelo Tab as one narrow browser function: a replacement new-tab workspace. The detailed description covers only existing capabilities:

- Quick Access shortcuts;
- open-tab management;
- local bookmark and recent-history access;
- local browsing-usage insights;
- search and light/dark appearance.

The primary category is Productivity. The listing clearly states that browsing insights are stored locally and can be cleared from Settings.

## Privacy disclosures

The release kit explicitly discloses that Pomelo Tab reads open-tab metadata, bookmarks, browsing history, and the currently active domain to provide its new-tab workspace and local insights. It does not claim that the extension collects no data merely because data remains on-device.

The recommended dashboard answers are derived from the current manifest and implementation:

- `storage`: store preferences, shortcuts, and on-device usage aggregates;
- `tabs`: list, focus, and close tabs and identify the active domain for local insights;
- `favicon`: display site icons;
- `bookmarks`: show and open bookmarks;
- `history`: show recent browsing history;
- `alarms`: update on-device usage aggregates once per minute;
- remote code: no;
- data transfer or sale: no;
- advertising, creditworthiness, and unrelated purposes: no.

The field guide tells the publisher to select the dashboard’s browsing-history category and to review the final wording against the exact labels shown in the live Dashboard, because Google can revise form labels independently of the extension package.

## First-run consent boundary

Pomelo Tab displays a focused first-run disclosure before it calls the Tabs, Bookmarks, History, or local usage-loading APIs. The disclosure names the browser data that will be handled, explains the local-only purpose, and states that the data is not transmitted or sold.

- `Enable Pomelo Tab` records a local consent flag and then initializes the full workspace.
- `Not now` leaves the user on a minimal new-tab surface and does not load browser library data or start usage recording.
- Settings provides a way to revoke consent and clear locally stored usage data.
- The background alarm checks the same consent flag before querying the focused window or active tab.
- Existing installations without the new consent flag are treated as not yet enabled and see the disclosure once after updating.

The disclosure remains concise and uses the current Pomelo visual language. It is not hidden in the privacy policy or store description.

## Privacy policy

The privacy policy explains:

- what browser data is accessed;
- why each data type is required;
- that processing and storage occur locally in Chrome storage;
- that data is not transmitted, sold, rented, used for advertising, or read by the publisher;
- how users can clear stored insights or uninstall the extension;
- how policy changes and contact details are handled.

The policy contains one explicit placeholder for the publisher’s public support email. The checklist blocks submission until the publisher replaces it. The HTML version is static and can be hosted on GitHub Pages, a product website, or another public HTTPS URL.

## Verification

Before handoff:

1. Confirm every raster asset has the required pixel dimensions.
2. Visually inspect screenshots and promo tiles for clipping, mismatched logos, and illegible text.
3. Confirm screenshot content reflects the current `1.0.0` build.
4. Verify no Tabs, Bookmarks, History, or usage-loading API is called before consent, and the background alarm exits before querying browser state.
5. Cross-check listing claims and permission explanations against `manifest.json`, `background.js`, `main.ts`, and `storage.ts`.
6. Confirm English and Chinese listing content describe the same behavior.
7. Scan every submission file for unresolved placeholders; only the clearly labelled publisher support email may remain.
8. Confirm the rebuilt extension ZIP passes `unzip -t`.

## Out of scope

- Publishing through the user’s Google account.
- Paying the developer registration fee.
- Hosting the privacy policy without a user-selected public domain or repository.
- Creating capabilities, analytics, accounts, sync, or cloud storage that Pomelo Tab does not provide.
- Producing a marketing video.

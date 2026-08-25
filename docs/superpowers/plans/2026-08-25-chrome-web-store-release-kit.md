# Pomelo Tab Chrome Web Store Release Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-run privacy consent boundary and produce a complete bilingual Chrome Web Store submission kit with verified screenshots, promotional assets, privacy documents, and an updated upload ZIP.

**Architecture:** A small consent module owns the local consent key and state checks. The new-tab initializer renders a disclosure-only surface until consent is granted, while the background usage tick checks the same flag before accessing browser state. Store materials are generated under the ignored `release/store-listing/` directory from the real running UI and deterministic SVG sources.

**Tech Stack:** TypeScript 5.9, Vite 7, Manifest V3, Node test runner, Chrome browser automation, SVG, ImageMagick, Markdown, static HTML.

## Global Constraints

- Do not access Tabs, Bookmarks, History, or active-domain data before explicit consent.
- Keep all browsing data on-device and make no network-data claims beyond the current code.
- Preserve the approved Pomelo visual system and citrus-slice mark.
- Do not add product capabilities that are absent from version `1.0.0`.
- Screenshots must be real product UI at exactly `1280 × 800px`.
- The small promo tile must be exactly `440 × 280px`; the marquee tile must be exactly `1400 × 560px`.
- English is the default listing language; Simplified Chinese is supplied as a matching localization.
- Submission-only files remain outside the extension ZIP.

---

### Task 1: Add the consent state boundary

**Files:**
- Create: `src/privacy-consent.ts`
- Create: `tests/privacy-consent.test.mjs`
- Modify: `package.json`
- Modify: `src/main.ts`
- Modify: `src/style.css`

**Interfaces:**
- Produces: `privacyConsentKey`, `isPrivacyConsentGranted(value)`, `loadPrivacyConsent()`, `savePrivacyConsent(granted)`.
- Consumes: `chrome.storage.local` when available and `localStorage` in Vite preview mode.

- [ ] **Step 1: Write the failing consent tests**

Test that only literal `true` grants consent and that the stable storage key is `pomelo-privacy-consent-v1`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/privacy-consent.test.mjs`

Expected: failure because `src/privacy-consent.ts` does not exist.

- [ ] **Step 3: Implement the consent module**

Add pure state checking plus Chrome/localStorage load and save functions. Do not import browser-library code into this module.

- [ ] **Step 4: Gate new-tab initialization**

Replace the unconditional `Promise.all([loadState(), loadOpenTabs(), loadLibraryData(), loadUsage()])` startup with:

1. load preferences and consent;
2. render a disclosure surface when consent is not granted;
3. load tabs, bookmarks, history, and usage only after `Enable Pomelo Tab`;
4. store `false` and show a paused surface after `Not now`;
5. attach live tab listeners only after consent.

Use this exact disclosure meaning:

> Pomelo Tab uses your open tabs, bookmarks, recent history, and active website domain to organize your workspace and calculate local usage insights. This data stays in Chrome on this device and is never transmitted, sold, or used for advertising.

- [ ] **Step 5: Style the consent surface**

Use the existing top bar, citrus mark, violet-orange gradient, and calm full-screen spacing. Keep `Enable Pomelo Tab` primary and `Not now` quiet but visible. Add a link to the packaged privacy page.

- [ ] **Step 6: Run tests and build**

Run: `npm test`

Expected: all tests pass.

Run: `npm run build`

Expected: TypeScript and Vite succeed.

---

### Task 2: Gate background usage and support revocation

**Files:**
- Modify: `tests/privacy-consent.test.mjs`
- Modify: `public/background.js`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: the exact `pomelo-privacy-consent-v1` storage key from Task 1.
- Produces: a background tick that exits before `chrome.windows.getLastFocused()` when consent is absent, plus a Settings revocation action.

- [ ] **Step 1: Add a failing background-order test**

Read `public/background.js` and assert that the consent lookup and early return appear before the first window or tab query.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/privacy-consent.test.mjs`

Expected: failure because the current alarm queries the focused window first.

- [ ] **Step 3: Gate the background alarm**

Load consent before accessing browser state. Reuse the returned storage object to read usage data after permission is confirmed.

- [ ] **Step 4: Add Settings revocation**

Add a `Pause browser access` control. After confirmation it stores consent `false`, clears the local usage key, and renders the paused privacy surface. Preserve shortcuts, display name, and theme.

- [ ] **Step 5: Verify consent flows in the browser**

Confirm first-run disclosure, Not now, Enable, reload persistence, Settings revocation, and zero document scrolling.

---

### Task 3: Prepare listing and privacy content

**Files:**
- Modify: `PRIVACY.md`
- Create: `public/privacy.html`
- Create: `release/store-listing/listing-en.md`
- Create: `release/store-listing/listing-zh-CN.md`
- Create: `release/store-listing/privacy-answers.md`
- Create: `release/store-listing/privacy-policy.md`
- Create: `release/store-listing/privacy-policy.html`
- Create: `release/store-listing/submission-checklist.md`

**Interfaces:**
- Consumes: current manifest permissions and implemented consent behavior.
- Produces: exact copy-paste content for every Store Listing and Privacy practices field.

- [ ] **Step 1: Update the canonical privacy policy**

Rename the product to Pomelo Tab, explain local handling, first-run consent, revocation, deletion, no transfer, no sale, no advertising, no remote code, and Limited Use compliance. Keep a clearly marked publisher support-email placeholder.

- [ ] **Step 2: Create the packaged privacy page**

Render the same policy as a readable static HTML page included in `dist/privacy.html` and linked from the disclosure surface.

- [ ] **Step 3: Write bilingual listing copy**

Provide exact title, summary under 132 characters, category, detailed description, support copy, and localization notes. Keep feature sets equivalent across languages.

- [ ] **Step 4: Write exact privacy answers**

Include the single-purpose statement; justifications for `storage`, `tabs`, `favicon`, `bookmarks`, `history`, and `alarms`; remote-code answer `No`; browsing-history disclosure; limited-use certifications; and privacy-policy URL instructions.

- [ ] **Step 5: Write the ordered submission checklist**

Map each dashboard tab and field to the exact prepared file and asset. Block submission until the support email and public HTTPS privacy-policy URL are replaced.

---

### Task 4: Capture screenshots and create promotional assets

**Files:**
- Create: `release/store-listing/assets/screenshots/01-privacy-onboarding.png`
- Create: `release/store-listing/assets/screenshots/02-open-tabs.png`
- Create: `release/store-listing/assets/screenshots/03-bookmarks.png`
- Create: `release/store-listing/assets/screenshots/04-insights.png`
- Create: `release/store-listing/assets/promo/pomelo-tab-small-440x280.svg`
- Create: `release/store-listing/assets/promo/pomelo-tab-small-440x280.png`
- Create: `release/store-listing/assets/promo/pomelo-tab-marquee-1400x560.svg`
- Create: `release/store-listing/assets/promo/pomelo-tab-marquee-1400x560.png`
- Create: `release/store-listing/assets/icon-128.png`

**Interfaces:**
- Consumes: the hot-reloaded Pomelo Tab page and approved icon SVG.
- Produces: dimension-correct PNG files ready for Developer Dashboard upload.

- [ ] **Step 1: Capture the four real UI states**

Capture privacy onboarding before consent, then enable and capture Open Tabs, Bookmarks, and Insights. Save source screenshots without browser chrome.

- [ ] **Step 2: Crop screenshots to the official ratio**

Use ImageMagick to crop without distortion and resize to `1280 × 800px`. Preserve Pomelo branding and the primary content of each view.

- [ ] **Step 3: Create deterministic promo SVGs**

Use the exact citrus mark geometry and current palette. Small tile copy: `Your browser workspace, at a glance.` Marquee copy: `Tabs, bookmarks, history and insights — in one calm new tab.`

- [ ] **Step 4: Rasterize and visually inspect assets**

Rasterize SVGs to PNG and inspect all screenshots, promo tiles, and the copied store icon at original resolution.

- [ ] **Step 5: Verify exact dimensions**

Run `identify` over every asset and confirm the expected widths and heights.

---

### Task 5: Rebuild and verify the final submission bundle

**Files:**
- Replace: `release/pomelo-tab-v1.0.0.zip`
- Verify: `dist/**`
- Verify: `release/store-listing/**`

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: a verified extension upload archive plus a separate store-listing kit.

- [ ] **Step 1: Run the full checks**

Run: `npm test`

Run: `npm run build`

Run: `git diff --check`

Expected: all exit with code 0.

- [ ] **Step 2: Recreate the upload ZIP from `dist` contents**

Ensure `manifest.json` stays at ZIP root and the ignored store-listing materials are not included.

- [ ] **Step 3: Validate the archive**

Run: `unzip -t release/pomelo-tab-v1.0.0.zip`

Expected: no errors.

- [ ] **Step 4: Scan for blockers**

Search release documents for `TODO`, `TBD`, and placeholder markers. The only allowed blocker is the explicitly labelled publisher support email and public privacy-policy URL, both surfaced at the top of the checklist.

- [ ] **Step 5: Report the handoff**

Provide clickable paths for the ZIP, screenshots, promo files, listing copy, privacy answers, privacy policy, and checklist. State the remaining human-only fields and the final commit hashes.

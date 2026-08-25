# Pomelo Tab GitHub Pages Privacy Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Pomelo Tab's privacy policy through GitHub Pages, remove public placeholders, and produce an exact Chrome Web Store field-entry guide.

**Architecture:** Keep one identical static policy document in `public/privacy.html` for the packaged extension and `docs/privacy.html` for GitHub Pages, with an automated equality test. GitHub Pages deploys directly from `main` and `/docs`; the store guide and release kit reference the verified HTTPS policy URL.

**Tech Stack:** Manifest V3, TypeScript/Vite, Node test runner, static HTML, GitHub Pages, Chrome Web Store Developer Dashboard

## Global Constraints

- GitHub Pages source is `main` and `/docs`.
- The policy URL is `https://archerry.github.io/Pomelo_tab_google/privacy.html`.
- Public support uses `https://github.com/Archerry/Pomelo_tab_google/issues`.
- The private Chrome Web Store support-email field remains a publisher-entered value.
- Do not add analytics, cookies, tracking, a custom domain, or a Pages build framework.
- Preserve unrelated `.gitignore`, `package-lock.json`, `.superpowers/`, and untracked-plan changes.

---

### Task 1: Policy publication contract

**Files:**
- Create: `tests/privacy-publication.test.mjs`
- Modify: `PRIVACY.md`
- Modify: `public/privacy.html`
- Create: `docs/privacy.html`
- Create: `docs/index.html`

**Interfaces:**
- Consumes: existing packaged policy at `public/privacy.html`
- Produces: identical hosted policy at `docs/privacy.html` and a root redirect at `docs/index.html`

- [ ] **Step 1: Write the failing publication test**

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const issuesUrl = 'https://github.com/Archerry/Pomelo_tab_google/issues'

test('packaged and hosted privacy policies are identical and publishable', async () => {
  const packaged = await readFile(new URL('../public/privacy.html', import.meta.url), 'utf8')
  const hosted = await readFile(new URL('../docs/privacy.html', import.meta.url), 'utf8')
  const markdown = await readFile(new URL('../PRIVACY.md', import.meta.url), 'utf8')

  assert.equal(hosted, packaged)
  assert.match(hosted, /<title>Pomelo Tab Privacy Policy<\/title>/)
  assert.match(hosted, new RegExp(issuesUrl.replaceAll('/', '\\/')))
  assert.match(markdown, new RegExp(issuesUrl.replaceAll('/', '\\/')))
  assert.doesNotMatch(`${hosted}\n${markdown}`, /REPLACE BEFORE PUBLISHING|PUBLISHER SUPPORT EMAIL/)
})

test('Pages root redirects to the canonical policy', async () => {
  const index = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8')
  assert.match(index, /url=privacy\.html/)
  assert.match(index, /href="\.\/privacy\.html"/)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/privacy-publication.test.mjs`

Expected: FAIL because `docs/privacy.html` and `docs/index.html` do not exist.

- [ ] **Step 3: Replace the public contact and add Pages documents**

Replace the policy contact with:

```html
For privacy or support questions, open an issue at <a href="https://github.com/Archerry/Pomelo_tab_google/issues">github.com/Archerry/Pomelo_tab_google/issues</a>.
```

Use the same Issues URL in `PRIVACY.md`, copy the complete packaged HTML to `docs/privacy.html`, and create `docs/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=privacy.html" />
    <link rel="canonical" href="./privacy.html" />
    <title>Pomelo Tab Privacy Policy</title>
  </head>
  <body>
    <p><a href="./privacy.html">Open the Pomelo Tab Privacy Policy</a></p>
  </body>
</html>
```

- [ ] **Step 4: Run the focused and full tests**

Run: `node --test tests/privacy-publication.test.mjs && npm test`

Expected: all tests PASS.

### Task 2: Store field guide and release artifacts

**Files:**
- Create: `docs/chrome-web-store-submission-guide.md`
- Modify: `release/store-listing/privacy-policy.md`
- Modify: `release/store-listing/privacy-policy.html`
- Modify: `release/store-listing/privacy-answers.md`
- Modify: `release/store-listing/submission-checklist.md`

**Interfaces:**
- Consumes: verified policy URL and existing English/Chinese listings
- Produces: exact Chinese step-by-step field map and synchronized local release kit

- [ ] **Step 1: Write the field guide**

Document the exact Developer Dashboard section, field label, source file, and paste-ready content for:

- Store listing name, summaries, descriptions, category, icon, screenshots, and promotional images;
- Single purpose and each permission justification;
- Remote-code answer and data-category selections;
- Limited Use certifications and privacy-policy URL;
- Distribution, mature-content, purchase, and support settings;
- final Preview and Submit for review checks.

The privacy-policy field must contain exactly:

```text
https://archerry.github.io/Pomelo_tab_google/privacy.html
```

- [ ] **Step 2: Synchronize release-only policy files**

Copy the final tracked policy content to the ignored release-kit copies and replace the URL placeholder in `privacy-answers.md` with the exact Pages URL. Leave only the publisher's private support-email value as a Dashboard action, not as a public source placeholder.

- [ ] **Step 3: Scan for unresolved publication placeholders**

Run:

```bash
rg -n "REPLACE BEFORE PUBLISHING|PUBLISHER SUPPORT EMAIL|PUBLIC HTTPS PRIVACY" PRIVACY.md public/privacy.html docs release/store-listing
```

Expected: no matches.

### Task 3: Build, commit, and push

**Files:**
- Modify: `release/pomelo-tab-v1.0.0.zip`

**Interfaces:**
- Consumes: final tracked policy and Pages files
- Produces: verified remote `main` commit and uploadable extension ZIP

- [ ] **Step 1: Run production verification**

Run: `npm test && npm run build && git diff --check`

Expected: all tests PASS, Vite build succeeds, and diff check has no output.

- [ ] **Step 2: Rebuild and test the ZIP**

Run from `dist/`:

```bash
zip -FS -r ../release/pomelo-tab-v1.0.0.zip .
unzip -t ../release/pomelo-tab-v1.0.0.zip
```

Expected: `No errors detected in compressed data`.

- [ ] **Step 3: Commit only scoped tracked files**

```bash
git add PRIVACY.md public/privacy.html docs/privacy.html docs/index.html docs/chrome-web-store-submission-guide.md tests/privacy-publication.test.mjs
git commit -m "docs: publish Pomelo privacy policy"
```

- [ ] **Step 4: Push and verify the remote SHA**

Run:

```bash
git push origin main
git ls-remote --heads origin main
```

Expected: the remote `main` SHA equals local `git rev-parse HEAD`.

### Task 4: Enable and verify GitHub Pages

**Files:**
- No repository file changes

**Interfaces:**
- Consumes: pushed `main/docs` documents
- Produces: public HTTPS privacy-policy URL

- [ ] **Step 1: Configure Pages in GitHub**

Open repository **Settings → Pages**, select **Deploy from a branch**, choose branch **main**, folder **/docs**, and save.

- [ ] **Step 2: Wait for GitHub's Pages deployment to succeed**

Verify the Pages settings page reports the site as published. If deployment is still pending, poll the same authoritative status instead of changing configuration.

- [ ] **Step 3: Verify the public site without authentication**

Open `https://archerry.github.io/Pomelo_tab_google/privacy.html` and confirm:

- HTTP access succeeds over HTTPS;
- title is `Pomelo Tab Privacy Policy`;
- policy text and Issues contact are visible;
- no login is required;
- no unresolved placeholder appears.

- [ ] **Step 4: Final handoff**

Report the public repository URL, policy URL, commit SHA, ZIP SHA-256, verification results, and the exact remaining human-only Dashboard steps.

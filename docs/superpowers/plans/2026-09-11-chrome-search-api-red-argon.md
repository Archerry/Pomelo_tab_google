# Chrome Search API / Red Argon Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Pomelo Tab's new-tab search field while routing ordinary searches through the user's Chrome default search provider and preparing a compliant `1.0.2` resubmission.

**Architecture:** A focused `new-tab-search.ts` module classifies input and delegates either direct URL navigation or default-provider search through injected operations. `main.ts` supplies browser operations, while manifest permissions, store copy, and release metadata document exactly the same behavior.

**Tech Stack:** TypeScript, Chrome Extension Manifest V3, `chrome.search`, Node.js test runner, Vite

## Global Constraints

- Keep the extension's single purpose as a local Chrome new-tab workspace.
- Never declare `chrome_settings_overrides`, `search_provider`, `omnibox`, or search host permissions.
- Never fall back to Google or another fixed web search provider.
- Preserve existing direct navigation for URL-like input.
- Release version is exactly `1.0.2`.
- Preserve unrelated local changes and ignored release assets.

---

### Task 1: Testable New-Tab Search Routing

**Files:**
- Create: `src/new-tab-search.ts`
- Create: `tests/new-tab-search.test.mjs`
- Modify: `src/main.ts:1-3,339-348`
- Modify: `src/chrome.d.ts`

**Interfaces:**
- Consumes: `SearchOperations` with `navigate(url: string): void` and `search(text: string): Promise<void>`.
- Produces: `directUrlFor(rawInput: string): string | null` and `submitNewTabSearch(rawInput: string, operations: SearchOperations): Promise<void>`.

- [ ] **Step 1: Write failing routing tests**

Create `tests/new-tab-search.test.mjs` importing `directUrlFor` and `submitNewTabSearch` from `../src/new-tab-search.ts`. Assert that `example.com/docs` becomes `https://example.com/docs`, an existing HTTPS URL is unchanged, and `privacy respecting search` calls only `search('privacy respecting search')`.

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { directUrlFor, submitNewTabSearch } from '../src/new-tab-search.ts'

test('directUrlFor preserves URL navigation', () => {
  assert.equal(directUrlFor('example.com/docs'), 'https://example.com/docs')
  assert.equal(directUrlFor('https://example.com/docs'), 'https://example.com/docs')
  assert.equal(directUrlFor('privacy respecting search'), null)
})

test('ordinary text uses the supplied default-provider search operation', async () => {
  const calls = []
  await submitNewTabSearch('  privacy respecting search  ', {
    navigate: url => calls.push(['navigate', url]),
    search: async text => calls.push(['search', text]),
  })
  assert.deepEqual(calls, [['search', 'privacy respecting search']])
})

test('URL-like input navigates without invoking web search', async () => {
  const calls = []
  await submitNewTabSearch('example.com/docs', {
    navigate: url => calls.push(['navigate', url]),
    search: async text => calls.push(['search', text]),
  })
  assert.deepEqual(calls, [['navigate', 'https://example.com/docs']])
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/new-tab-search.test.mjs`

Expected: FAIL because `src/new-tab-search.ts` does not exist.

- [ ] **Step 3: Implement the routing module**

Create the module with the existing URL-recognition rule and injected operations:

```ts
export type SearchOperations = {
  navigate(url: string): void
  search(text: string): Promise<void>
}

export function directUrlFor(rawInput: string): string | null {
  const query = rawInput.trim()
  if (!/^(https?:\/\/|localhost|([\w-]+\.)+[a-z]{2,})(\/|$)/i.test(query)) return null
  return /^https?:\/\//i.test(query) ? query : `https://${query}`
}

export async function submitNewTabSearch(rawInput: string, operations: SearchOperations): Promise<void> {
  const query = rawInput.trim()
  if (!query) return
  const directUrl = directUrlFor(query)
  if (directUrl) {
    operations.navigate(directUrl)
    return
  }
  await operations.search(query)
}
```

- [ ] **Step 4: Integrate the helper with the page**

Import `submitNewTabSearch` in `src/main.ts`. Replace the synchronous hard-coded Google submit listener with an async listener that passes:

```ts
{
  navigate: url => { location.href = url },
  search: async text => {
    if (typeof chrome === 'undefined' || !chrome.search?.query) {
      throw new Error('Chrome Search API is unavailable')
    }
    await chrome.search.query({ text, disposition: 'CURRENT_TAB' })
  },
}
```

Clear the input's custom validity before submission. On failure, log `Unable to search with the default provider`, set custom validity to `Search is unavailable in this browser.`, and call `reportValidity()` without redirecting to a fixed provider.

Add the API contract used by the integration to `src/chrome.d.ts`:

```ts
search?: {
  query(queryInfo: {
    text: string
    disposition?: 'CURRENT_TAB' | 'NEW_TAB' | 'NEW_WINDOW'
  }): Promise<void>
}
```

- [ ] **Step 5: Run focused tests and build**

Run: `node --test tests/new-tab-search.test.mjs`

Expected: 3 tests pass.

Run: `npm run build`

Expected: TypeScript compilation and the Vite build pass.

- [ ] **Step 6: Commit search routing**

```bash
git add src/new-tab-search.ts src/main.ts src/chrome.d.ts tests/new-tab-search.test.mjs
git commit -m "fix: respect Chrome default search provider"
```

### Task 2: Manifest, Type Contract, and Store Metadata

**Files:**
- Modify: `public/manifest.json`
- Modify: `src/main.ts:240-255`
- Modify: `tests/store-metadata.test.mjs`
- Modify: `docs/chrome-web-store-submission-guide.md`

**Interfaces:**
- Consumes: `chrome.search.query({ text, disposition })` integration and type contract from Task 1.
- Produces: manifest permission `search`, version `1.0.2`, and paste-ready compliant store/resubmission copy.

- [ ] **Step 1: Write failing policy and metadata tests**

Extend `tests/store-metadata.test.mjs` to assert:

```js
assert.equal(manifest.version, '1.0.2')
assert.ok(manifest.permissions.includes('search'))
assert.equal(manifest.chrome_settings_overrides, undefined)
assert.doesNotMatch(source, /google\.com\/search|Search Google/i)
assert.match(source, /default provider/i)
assert.match(guide, /pomelo-tab-v1\.0\.2\.zip/)
assert.match(guide, /Chrome Search API|chrome\.search/)
assert.doesNotMatch(guide, /Search Google|使用 Google 搜索/)
```

Read `src/main.ts` into `source` in the test. Replace existing `1.0.1` expectations with `1.0.2`.

- [ ] **Step 2: Run metadata test and verify RED**

Run: `node --test tests/store-metadata.test.mjs`

Expected: FAIL because the manifest is `1.0.1`, lacks `search`, and source/store copy still mentions Google.

- [ ] **Step 3: Update the manifest**

Change `public/manifest.json` version to `1.0.2` and append `search` to `permissions` without adding any settings override or host permission.

- [ ] **Step 4: Update runtime and store wording**

Change the new-tab field placeholder and accessible label to `Search with your default provider or enter a URL`.

Update `docs/chrome-web-store-submission-guide.md` to version `1.0.2`, change English and Chinese search claims to the user's default provider, add the `search` permission justification, and add this resubmission statement:

```text
Pomelo Tab 1.0.2 removes the hard-coded Google Search URL. All non-URL web searches from the new-tab page now use chrome.search.query with CURRENT_TAB, which respects the user's active Chrome default search provider. The extension does not declare chrome_settings_overrides and does not change the user's default search provider. URL-like input continues to navigate directly.
```

- [ ] **Step 5: Verify metadata, routing, and production build**

Run: `node --test tests/store-metadata.test.mjs tests/new-tab-search.test.mjs`

Expected: all focused tests pass.

Run: `npm run build`

Expected: TypeScript and Vite build pass with `dist/manifest.json` version `1.0.2` and permission `search`.

- [ ] **Step 6: Commit compliance metadata**

```bash
git add public/manifest.json src/main.ts tests/store-metadata.test.mjs docs/chrome-web-store-submission-guide.md
git commit -m "chore: prepare compliant 1.0.2 resubmission"
```

### Task 3: Full Verification, Release ZIP, and GitHub Delivery

**Files:**
- Verify: `dist/**`
- Create locally: `release/pomelo-tab-v1.0.2.zip`
- Verify: all files changed since design commit `5acc27f`

**Interfaces:**
- Consumes: successful Task 1 and Task 2 implementation.
- Produces: verified local Chrome Web Store upload ZIP and GitHub `main` containing the source/docs/tests for version `1.0.2`.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Run a fresh production build**

Run: `npm run build`

Expected: exit code 0; `dist/manifest.json` contains version `1.0.2`, permission `search`, and no `chrome_settings_overrides`.

- [ ] **Step 3: Create the Chrome Web Store ZIP**

From `dist/`, run:

```bash
mkdir -p ../release
zip -FS -r ../release/pomelo-tab-v1.0.2.zip .
```

Expected: `manifest.json` is at the archive root and no source, test, plan, or store-listing file is included.

- [ ] **Step 4: Verify archive and policy boundary**

Run: `unzip -t release/pomelo-tab-v1.0.2.zip`

Expected: `No errors detected`.

Run: `unzip -p release/pomelo-tab-v1.0.2.zip manifest.json`

Expected: version `1.0.2`, permission `search`, new-tab override present, and no search-provider override.

Run: `rg -n "google\\.com/search|Search Google|使用 Google 搜索|chrome_settings_overrides|search_provider" src public docs/chrome-web-store-submission-guide.md tests`

Expected: no prohibited runtime/store claims or declarations; test assertions and historical design discussion may contain the searched terms only as negative checks or root-cause documentation.

- [ ] **Step 5: Review diff and whitespace**

Run: `git diff --check 5acc27f..HEAD`

Expected: no output.

Run: `git diff --stat 5acc27f..HEAD` and `git diff 5acc27f..HEAD -- src public tests docs/chrome-web-store-submission-guide.md`

Expected: only scoped search compliance, tests, version, and submission guidance changes.

- [ ] **Step 6: Deliver to GitHub**

Bring the isolated commits back to local `main` without including unrelated worktree changes. Re-run `npm test`, `npm run build`, archive verification, and `git diff --check` from the delivery checkout. Push with:

```bash
git push origin main
```

Verify with:

```bash
git ls-remote --heads origin main
```

Expected: remote `refs/heads/main` matches local `git rev-parse HEAD`.

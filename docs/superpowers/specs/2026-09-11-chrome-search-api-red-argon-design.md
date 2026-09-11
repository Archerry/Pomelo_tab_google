# Chrome Search API / Red Argon Remediation Design

## Goal

Resolve the Chrome Web Store `Red Argon` rejection while keeping Pomelo Tab's single purpose: replacing Chrome's new-tab page with one local browser workspace.

## Root Cause

Pomelo Tab currently overrides Chrome's new-tab page and sends non-URL search input directly to a hard-coded Google Search URL. This bypasses the search provider selected by the user in Chrome and violates the new-tab search requirement cited in the rejection.

Pomelo Tab does not currently declare `chrome_settings_overrides` and does not change Chrome's default search provider. The remediation must preserve that boundary.

## Runtime Behavior

- Keep the existing search field on the Pomelo new-tab page.
- Continue opening URL-like input directly in the current tab.
- Send all other input through `chrome.search.query` with `CURRENT_TAB`, so Chrome uses the user's active default search provider.
- Do not add a fallback that targets Google or any other fixed search provider.
- If the Chrome Search API is unavailable, report the failure in the page without redirecting to a fixed provider.

The search submission flow will be isolated behind a small helper so URL navigation and default-provider search can be tested independently from the rest of the page rendering.

## Manifest and Types

- Add the required `search` permission to `public/manifest.json`.
- Add the `chrome.search.query` contract to the project's Chrome TypeScript declaration.
- Do not add `chrome_settings_overrides`, `search_provider`, `omnibox`, or host permissions.

## Store Metadata and Release

- Increase the extension manifest version from `1.0.1` to `1.0.2`.
- Replace claims such as “Search Google” with wording that says Pomelo searches with the user's default search provider.
- Update the single-purpose statement and add a `search` permission justification that matches the implementation.
- Add a paste-ready resubmission note explaining the `Red Argon` correction.
- Build and verify `release/pomelo-tab-v1.0.2.zip` from the production output without changing unrelated release assets.

## Verification

Automated tests will verify that:

- the manifest declares `search` and does not declare a search-provider override;
- ordinary queries use `chrome.search.query` with `CURRENT_TAB`;
- URL-like input still opens directly and does not invoke web search;
- source and store copy no longer hard-code Google as the search provider;
- all package metadata and guide references use version `1.0.2`.

After focused tests pass, run the full test suite, TypeScript/Vite production build, ZIP integrity check, and `git diff --check`. Then commit the implementation and push `main` to GitHub.

## Non-goals

- Changing the user's default search provider.
- Publishing a separate search-provider extension.
- Redesigning the new-tab UI.
- Changing tab, bookmark, history, shortcut, usage-insight, consent, or privacy-storage behavior.

# Pomelo Tab GitHub Pages privacy-policy design

Date: 2026-08-25

## Goal

Publish Pomelo Tab's privacy policy from the now-public `Archerry/Pomelo_tab_google` repository at a stable public HTTPS URL suitable for the Chrome Web Store privacy-policy field.

## Hosting approach

GitHub Pages will deploy directly from the `main` branch and `/docs` directory. This avoids a build workflow for a single static policy and keeps the public page reviewable in the same repository as the extension.

- Source file: `docs/privacy.html`
- Convenience landing page: `docs/index.html`
- Expected policy URL: `https://archerry.github.io/Pomelo_tab_google/privacy.html`
- Expected site root: `https://archerry.github.io/Pomelo_tab_google/`

Both URLs show the same privacy policy. The policy URL is the value entered in the Chrome Web Store.

## Policy content and contact

The hosted policy, packaged `public/privacy.html`, and repository `PRIVACY.md` describe the same behavior:

- browser-data features remain paused until the user explicitly enables Pomelo Tab;
- tabs, bookmarks, recent history, active-domain usage, shortcuts, and preferences are processed locally;
- data is not transmitted, sold, used for advertising, or used for unrelated purposes;
- Pomelo Tab does not execute remotely hosted code;
- users can pause access and clear locally stored usage insights.

The public policy links to `https://github.com/Archerry/Pomelo_tab_google/issues` for privacy and support questions. This provides a durable public contact path without publishing a private email address in source control. The publisher still enters and verifies a support email privately in the Chrome Web Store Developer Dashboard.

## Repository and release changes

1. Add the static Pages documents under `docs/`.
2. Replace the policy email placeholder in `PRIVACY.md` and `public/privacy.html` with the GitHub Issues contact.
3. Update the local release-kit copies and set the final public policy URL in `release/store-listing/privacy-answers.md`.
4. Rebuild and verify `release/pomelo-tab-v1.0.0.zip` so the packaged privacy page has no placeholder.
5. Commit and push only the scoped policy/Pages changes, preserving existing unrelated worktree changes.
6. Configure GitHub Pages to deploy from `main` and `/docs`.

## Verification

The work is complete only when:

- GitHub reports the repository as Public;
- the remote `main` SHA contains the Pages and policy commit;
- GitHub Pages reports a successful deployment;
- the public policy URL loads over HTTPS without GitHub authentication;
- the page title is `Pomelo Tab Privacy Policy` and the policy text is visible;
- the hosted policy contains no unresolved placeholder;
- the extension tests and production build pass;
- the rebuilt ZIP passes `unzip -t`;
- the Chrome Web Store field guide contains the exact live policy URL.

## Out of scope

- Publishing the Chrome Web Store item or paying registration fees;
- entering or verifying the publisher's private support email;
- adding analytics, cookies, tracking, a custom domain, or a Pages build framework.

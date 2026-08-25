# Pomelo visual polish design

Date: 2026-08-25

## Goal

Refine the existing full-screen Pomelo new-tab workspace without changing its core layout. The result should feel lighter, easier to scan, and clearly related to Pomelo and citrus without becoming a playful fruit theme or an admin dashboard.

## Scope

This change covers five areas:

1. Simplify Quick Access while preserving add, edit, and delete operations.
2. Improve the spacing and readability of the top-right clock.
3. Increase typography sizes in Insights.
4. Remove redundant interface copy.
5. Replace the current Pomelo logo and extension icon with a simplified citrus-slice mark.

The existing orange-violet palette, full-screen layout, navigation, search behavior, bookmark/history grouping, and usage data behavior remain unchanged.

## Quick Access

Quick Access remains a visually separate section above the library. Its label stays visible so users can identify the section immediately.

Each shortcut tile displays only:

- the site's favicon, with the existing letter fallback;
- the shortcut name.

The domain subtitle and shortcut capacity count are removed.

Shortcut tiles use the approved interaction language:

- no upward movement;
- no full hover outline;
- a light tinted surface and soft shadow;
- a narrow internal purple-to-orange gradient accent.

On pointer hover or keyboard focus, a single ellipsis button appears in the upper-right corner. Activating it opens a small menu with Edit and Delete. The menu closes when the user selects an action, clicks outside it, or presses Escape. Delete continues to require confirmation before state is changed.

The final tile remains a dedicated plus control for adding a shortcut. It appears only when the existing shortcut limit has not been reached.

The existing shortcut form, validation, persistence, and favicon fallback are reused.

## Clock

The clock remains aligned to the right side of the hero title row. It uses tabular numerals, a modest positive letter spacing, and a small right inset so time strings such as `12:08` do not appear compressed against the viewport edge.

The current responsive font sizing remains, with a smaller spacing adjustment on narrow viewports if needed.

## Insights typography

Insights keeps its existing structure, data, period filters, and bars. Only typography and related spacing change:

- summary labels: 12px;
- summary values: 30px;
- domain names: 13px;
- ranks: 11px;
- usage time: 12px;
- period controls: 11px.

Rows gain enough height and spacing to support these sizes without crowding. Mobile layouts retain the existing rule that hides the bar track when space is limited.

## Copy reduction

Remove copy that repeats information already communicated by position or navigation:

- the Quick Access capacity count;
- shortcut domain subtitles;
- `LIVE BROWSER`, `LOCAL LIBRARY`, and `LOCAL ANALYTICS` eyebrows;
- library header badges such as tab, saved, visit, and private/local counts.

Keep functional copy required for orientation or safe operation:

- view titles;
- search placeholders;
- dialog field labels and validation errors;
- empty states;
- destructive-action confirmation text.

## Pomelo logo

Use the approved citrus-slice direction.

The mark consists of:

- a violet rounded-square field;
- a simplified citrus slice with a small number of broad segments;
- warm orange and cream segment colors;
- shapes thick enough to remain legible at 16px.

The top navigation uses the mark beside the `pomelo.` wordmark. Extension icons use the mark alone. The source of truth is `public/icons/icon-source.svg`; 16px, 32px, 48px, and 128px PNG assets are regenerated from that source.

The design avoids thin radial lines, literal leaves, faces, and ornamental fruit details.

## Interaction and accessibility

- Pointer and keyboard users can reach the shortcut menu.
- Focus indicators remain visible and internal to clipped containers.
- The ellipsis button has an accessible label containing the shortcut name.
- The menu uses button elements for Edit and Delete.
- Escape closes the open menu without changing shortcut state.
- Reduced-motion preferences continue to disable nonessential transitions.

## State and data flow

No storage schema changes are required.

- Add and edit continue to update `state.shortcuts` and call `saveState`.
- Delete updates state only after confirmation.
- Opening or closing the shortcut menu is ephemeral UI state and is not persisted.
- Insights continues to read the existing local usage record and period selection.

## Verification

After implementation:

1. Inspect the hot-reloaded page at desktop and narrow widths.
2. Verify shortcut add, edit, delete, outside-click close, and Escape close.
3. Verify shortcut links remain usable and favicon fallback still works.
4. Verify the clock at multiple times and viewport widths.
5. Verify Insights typography for 7-day, 30-day, and all-time views, including empty data.
6. Inspect the logo at navigation size and all extension icon sizes.
7. Verify light and dark themes, keyboard focus, and reduced motion.
8. Run `npm run build`.

## Out of scope

- Reworking the overall page layout.
- Changing the orange-violet palette.
- Changing bookmark, history, click-count, or usage-statistics behavior.
- Adding shortcut drag-and-drop or reordering.

# Quick Access 20-Shortcut Design

## Goal

Increase the Quick Access capacity from 8 to 20 shortcuts while preserving the current shortcut tile dimensions and allowing the layout to adapt to the browser width.

## Behavior

- Users can add shortcuts until Quick Access contains 20 items.
- The add-shortcut tile is shown for 0 through 19 saved shortcuts and hidden at 20.
- The add dialog refuses to open for a new shortcut when 20 shortcuts already exist.
- Editing and deleting existing shortcuts continue to work at the limit.
- Existing shortcut storage remains unchanged; no migration is required.

## Layout

Quick Access uses a wrapping CSS Grid. Each shortcut and the add tile remains `156 x 54px`. The grid computes how many complete tiles fit in the available container width and places that maximum on each row before wrapping. It does not stretch or shrink tiles to fill a row.

The existing page shell remains fixed to the viewport. Additional Quick Access rows consume vertical space, and the library area continues to use the remaining space and its existing internal scrolling behavior.

## Documentation

The English and Simplified Chinese Chrome Web Store descriptions are updated from 8 to 20 Quick Access shortcuts so published product copy matches runtime behavior.

## Verification

Automated tests will verify:

- the application limit is 20;
- the add tile and add-dialog guard use the shared limit;
- the Quick Access grid uses browser-width-dependent wrapping with fixed `156 x 54px` tiles;
- store descriptions advertise 20 shortcuts in both languages.

Run the focused test first to observe it fail, implement the minimum changes, then run the full test suite and production build.

## Non-goals

- Changing shortcut tile dimensions or visual styling.
- Adding drag-and-drop, reordering, pagination, or horizontal scrolling.
- Changing the storage schema or default shortcuts.

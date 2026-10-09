---
paths:
  - "__FRONTEND_GLOBS__"
---
<!--
  Project rule (owned by this project, at most 80 lines). Loads only when Claude works on UI
  files. __FRONTEND_GLOBS__ is a placeholder that matches nothing: /team:new-project replaces it
  with the stack's UI globs (components, pages, templates, styles).
-->
# Frontend

## Every view
- Handle every state: loading, empty, error and success. Errors say what happened and what to do next.
- Works from a 360 px wide phone to a desktop; no horizontal scrolling.
- New features render only when their flag is on (see `docs/flags.md`); the old path keeps working
  while it is off.

## Accessibility
- Semantic HTML first: buttons for actions, links for navigation, real headings in order, lists for lists.
- Every form control has a visible label; errors are tied to their field and announced.
- Everything works with the keyboard alone, with a visible focus outline; dialogs trap and restore focus.
- Text contrast meets WCAG AA (4.5:1 for body text). Don't use color as the only signal.
- Images have alt text (empty alt for decoration).

## Dates and times
- The API sends UTC; convert only for display, in the project timezone, and name the timezone
  wherever a person might misread it (for example "3:00 PM Asia/Manila").
- Format with the platform's Intl APIs or the framework's helpers; never hand-build date strings.
- "Today", "yesterday" and date pickers use the project timezone, not the visitor's machine,
  unless the issue says otherwise.

## Data and privacy
- No secrets in client code or the built bundle; the pipeline scans the artifact for them.
- Don't send personal data to analytics, error trackers or the console.
- Keep test selectors stable: prefer roles and labels; add test ids only where needed.

<!-- Stack-specific additions (component library, styling approach, state management) go below this line. -->

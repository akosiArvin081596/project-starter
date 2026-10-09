---
paths:
  - "__TEST_GLOBS__"
---
<!--
  Project rule (owned by this project, at most 80 lines). Loads only when Claude works on files
  matching the paths above. __TEST_GLOBS__ is a placeholder that matches nothing:
  /team:new-project replaces it with the stack's test globs (for example tests/**, **/*.test.*,
  e2e/**). Don't repeat the always-on team rule (never weaken tests, regression tests, TZ=UTC).
-->
# Testing

## Layout
- <Stack: the test runner, where unit, integration and browser tests live, and how files are named.>
- <Stack: how to run one test file or one test by name.>
- Browser tests are Playwright in `e2e/`, run with `make e2e` against the worktree's app URL.

## Writing tests
- Test behaviour through public interfaces, not private helpers or implementation details.
- One reason to fail per test; name it after the behaviour ("rejects an expired token").
- Control time: freeze or inject the clock instead of sleeping or reading the machine's time.
  Cover the edges that bite: local midnight, month end, and daylight-saving changes in the project timezone.
- Fake data only: names, emails (example.invalid, example.com, *.test) and phones come from
  factories or fixtures. Never copy rows from a snapshot or production into a fixture.
- No real outside calls: mail, SMS, payments and webhooks run in log or sandbox mode (see `.env.example`),
  and tests stub them at the boundary.
- Tests that need a database use this worktree's own database (from the env file), never a shared one,
  and leave it as they found it (transactions or per-test cleanup).
- Each new flag gets tests for the main paths with the flag on and with it off.

## Browser tests (Playwright)
- The browser runs in the project timezone (`e2e/playwright.config.ts` sets `timezoneId`).
- Select elements by role, label or visible text; use test ids only when nothing else is stable.
- Wait on conditions with web-first assertions (toBeVisible, toHaveText), never fixed sleeps.
- Keep `e2e/tests/smoke.spec.ts` fast and app-wide: it runs after every staging deploy.

<!-- Stack-specific additions (fixtures folder, factories, coverage thresholds) go below this line. -->

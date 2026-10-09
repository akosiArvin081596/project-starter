// Timezone test: the browser runs in the project's timezone (not the machine's), and the
// local date rolls over exactly at local midnight. Uses Playwright's clock, so it is the same
// on a laptop in Manila and on a CI runner in UTC.
// Once the app shows dates (a "today" list, a report), add an assertion here on how it
// shows a time just before and just after local midnight.
import { test, expect, type Page } from '@playwright/test';
import { settings, missingBaseURL } from '../settings';

type WallTime = { year: number; month: number; day: number; hour: number; minute: number; second: number };

// Offset of `timeZone` from UTC at the given instant, in ms (Intl knows every IANA zone).
function offsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  const wallAsUtc = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'));
  return wallAsUtc - Math.floor(utcMs / 1000) * 1000;
}

// The UTC instant at which the clock on the wall in `timeZone` shows `wall`.
function zonedToUtc(wall: WallTime, timeZone: string): number {
  const guess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  const first = guess - offsetMs(guess, timeZone);
  return guess - offsetMs(first, timeZone);
}

// What the page itself sees: its timezone and its local date and time.
async function browserClock(page: Page, projectZone: string) {
  return page.evaluate((zone) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    return {
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      projectZone: new Intl.DateTimeFormat('en-US', { timeZone: zone }).resolvedOptions().timeZone,
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    };
  }, projectZone);
}

test.describe('project timezone', () => {
  test('browser uses the project timezone and the date rolls over at local midnight', async ({ page, baseURL }) => {
    expect(baseURL, missingBaseURL).toBeTruthy();
    const zone = settings.timezone;
    const beforeMidnight = zonedToUtc({ year: 2026, month: 1, day: 15, hour: 23, minute: 59, second: 30 }, zone);

    await page.clock.install({ time: beforeMidnight - 5 * 60_000 });
    await page.goto('/');
    await page.clock.pauseAt(beforeMidnight);

    const start = await browserClock(page, zone);
    expect(start.zone, 'browser timezone').toBe(start.projectZone);
    expect(start, `23:59:30 on 2026-01-15 in ${zone}`).toMatchObject({ date: '2026-01-15', time: '23:59:30' });

    await page.clock.runFor(29_000);
    expect(await browserClock(page, zone), 'one second before local midnight').toMatchObject({
      date: '2026-01-15',
      time: '23:59:59',
    });

    await page.clock.runFor(1_000);
    expect(await browserClock(page, zone), 'local midnight').toMatchObject({
      date: '2026-01-16',
      time: '00:00:00',
    });
  });
});

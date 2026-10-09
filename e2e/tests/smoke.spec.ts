// Smoke test: the app answers its health path and serves the home page.
// Runs after every staging deploy and by team-qa when nothing user-visible changed.
import { test, expect } from '@playwright/test';
import { settings, missingBaseURL } from '../settings';

test.describe('smoke', () => {
  test('health path returns 200', async ({ request, baseURL }) => {
    expect(baseURL, missingBaseURL).toBeTruthy();
    const response = await request.get(settings.healthPath);
    expect(response.status(), `GET ${settings.healthPath}`).toBe(200);
  });

  test('home page loads', async ({ page, baseURL }) => {
    expect(baseURL, missingBaseURL).toBeTruthy();
    const response = await page.goto('/');
    expect(response, 'no response for GET /').not.toBeNull();
    expect(response?.ok(), `GET / returned ${response?.status()}`).toBe(true);
    await expect(page.locator('body')).toBeVisible();
  });
});

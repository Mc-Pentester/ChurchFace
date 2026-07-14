import { test, expect } from '@playwright/test';

// This E2E test assumes you have a local/staging server running and TEST_USER_AUTH_COOKIE
// available to simulate an authenticated admin. Adjust environment variables as needed.

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CHURCH_SLUG = process.env.TEST_CHURCH_SLUG || 'test-church';
const ADMIN_COOKIE = process.env.TEST_ADMIN_COOKIE; // provide session cookie value

test.describe('Church page cache & admin privacy', () => {
  test('public response should not contain admin emails and should include Cache-Control header', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/church/${CHURCH_SLUG}`);
    expect(res.ok()).toBeTruthy();

    // header
    const cache = res.headers()['cache-control'] || '';
    expect(cache).toContain('s-maxage');

    const body = await res.json();
    // admins should not have email field
    expect(body.admins).toBeTruthy();
    for (const a of body.admins) {
      expect(a.user.email).toBeUndefined();
    }
  });

  test('authenticated admin should receive admin emails and no public cache header', async ({ playwright }) => {
    test.skip(!ADMIN_COOKIE, 'TEST_ADMIN_COOKIE not provided');

    const authReq = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        cookie: `next-auth.session-token=${ADMIN_COOKIE}`,
      },
    });

    const res = await authReq.get(`/api/church/${CHURCH_SLUG}`);
    expect(res.ok()).toBeTruthy();

    const cache = res.headers()['cache-control'] || '';
    // For authenticated responses we should not return public CDN caching
    expect(cache).toBe('');

    const body = await res.json();
    // admins should have email field
    expect(body.admins).toBeTruthy();
    let hasEmail = false;
    for (const a of body.admins) {
      if (a.user.email) hasEmail = true;
    }
    expect(hasEmail).toBeTruthy();
  });
});

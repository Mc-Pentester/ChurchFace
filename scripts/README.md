## Cache purge & E2E tests

This document explains how cache invalidation and tests are set up for the Church pages, and how to run the E2E test locally or in CI.

1) Cache purge helper (lib/cdn.ts)
- The repo includes `lib/cdn.ts` which knows how to purge Cloudflare caches for a given church page URL.
- Environment variables used by the helper:
  - CLOUDFLARE_API_TOKEN
  - CLOUDFLARE_ZONE_ID
  - NEXT_PUBLIC_APP_URL or APP_URL (to build the public URL)

2) Automatic purge on Church update
- The PATCH handler `app/api/church/[slug]/route.ts` calls the purge helper after successfully updating the church.
- If you use Cloudflare, make sure the environment variables are set in your deploy environment.

3) E2E test (Playwright)
- A small Playwright test `tests/e2e/church-cache.spec.ts` verifies:
  - Public responses do NOT include admin emails and include a Cache-Control header.
  - Authenticated admin responses DO include admin emails and do NOT include the public cache header.

How to run the test locally

1. Install Playwright (if not installed):

```bash
npm i -D @playwright/test
npx playwright install
```

2. Set required env vars (example):

```bash
export BASE_URL="http://localhost:3000"
export TEST_CHURCH_SLUG="your-church-slug"
# optional: TEST_ADMIN_COOKIE (a next-auth session cookie for an admin user)
```

3. Run the test:

```bash
npx playwright test tests/e2e/church-cache.spec.ts
```

CI notes
- In CI, provide stable credentials / test user cookie and run the Playwright test after deploying the branch to a staging environment.


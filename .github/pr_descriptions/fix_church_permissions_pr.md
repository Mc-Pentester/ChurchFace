Cache invalidation and revalidation notes

This PR adds a helper to purge Cloudflare caches and a Playwright test to validate cache headers and admin privacy. The helper is conservative:
- If CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID are present, it attempts to purge the specific public church URL.
- If not configured, it logs a warning and skips purge.

Recommendations for production
- Configure CLOUDFLARE_API_TOKEN & CLOUDFLARE_ZONE_ID in your production environment (or implement a provider-specific purge in lib/cdn.ts).
- Optionally, add provider-specific logic for other CDNs (Fastly, Akamai, etc.).
- For Next.js ISR on Vercel, consider calling `revalidatePath()` on the updated path where supported.

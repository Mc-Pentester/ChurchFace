import fetch from "node-fetch";

export async function purgeChurchCache(slug: string) {
  // Build the full public URL for the church page. Prefer NEXT_PUBLIC_APP_URL, then APP_URL
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.VERCEL_URL || "";
  const url = base ? `${base.replace(/\/+$/, "")}/church/${slug}` : undefined;

  // Cloudflare purge (recommended if you use Cloudflare CDN)
  const cfToken = process.env.CLOUDFLARE_API_TOKEN;
  const cfZone = process.env.CLOUDFLARE_ZONE_ID;
  if (cfToken && cfZone && url) {
    try {
      const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZone}/purge_cache`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: [url] }),
      });
      const data = await res.json();
      if (!data.success) {
        console.warn("Cloudflare purge returned non-success:", data);
      } else {
        console.log("Cloudflare cache purged for:", url);
      }
    } catch (err) {
      console.error("Cloudflare purge failed:", err);
    }
  }

  // Vercel / Next on-demand revalidation: if you run on a platform that supports revalidation via API,
  // you can call that here. For example, Vercel has a Deploy/Cache API or you can call a serverless
  // revalidate route that calls res.revalidate(path).
  // This helper intentionally does not call provider-specific APIs beyond Cloudflare. Add provider
  // logic here if needed.

  if (!cfToken && !cfZone) {
    console.warn("No CDN purge configured (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID missing). Skipping purge.");
  }
}

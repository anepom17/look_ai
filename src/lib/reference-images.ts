/**
 * Fetches a single reference image URL for a celebrity name via SerpApi Google Images.
 * Results are cached in memory by normalized name to stay within API quota (e.g. 100/month).
 */

const CACHE = new Map<string, string | null>();

function normalizeKey(name: string): string {
  return name.trim().toLowerCase();
}

interface SerpApiImageResult {
  thumbnail?: string;
  original?: string;
  position?: number;
  title?: string;
  link?: string;
}

interface SerpApiResponse {
  images_results?: SerpApiImageResult[];
  error?: string;
}

/**
 * Returns one image URL for the given reference name, or null if none found or API key missing.
 * Uses in-memory cache by normalized name; same celebrity across guides reuses the same request.
 */
export async function getImageForReference(name: string): Promise<string | null> {
  const key = normalizeKey(name);
  if (CACHE.has(key)) {
    return CACHE.get(key) ?? null;
  }

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    CACHE.set(key, null);
    return null;
  }

  const query = `${name.trim()} outfit style`;
  const params = new URLSearchParams({
    engine: "google_images",
    q: query,
    api_key: apiKey,
  });
  const url = `https://serpapi.com/search.json?${params.toString()}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      CACHE.set(key, null);
      return null;
    }
    const data = (await res.json()) as SerpApiResponse;
    const results = data?.images_results;
    const first = Array.isArray(results) && results.length > 0 ? results[0] : null;
    const imageUrl =
      first?.thumbnail && first.thumbnail.trim() !== ""
        ? first.thumbnail
        : first?.original && first.original.trim() !== ""
          ? first.original
          : null;
    CACHE.set(key, imageUrl);
    return imageUrl;
  } catch {
    CACHE.set(key, null);
    return null;
  }
}

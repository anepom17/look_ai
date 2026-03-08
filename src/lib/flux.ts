/**
 * Black Forest Labs FLUX 2 Pro — image generation for outfit looks.
 * API: https://docs.bfl.ml — async submit then poll for result; image delivered via signed URL.
 */

const BFL_BASE = process.env.BFL_API_BASE ?? "https://api.bfl.ai";
const FLUX_2_PRO_PATH = "/v1/flux-2-pro";
const POLL_INTERVAL_MS = 800;
const POLL_TIMEOUT_MS = 120_000;

function getApiKey(): string {
  const key = process.env.FLUX_API_KEY ?? process.env.BFL_API_KEY;
  if (!key) throw new Error("Missing FLUX_API_KEY or BFL_API_KEY");
  return key;
}

interface SubmitResponse {
  id: string;
  polling_url: string;
}

interface PollResponse {
  status: string;
  result?: { sample?: string };
  error?: string;
}

/** Submit image generation job; returns id and polling_url. */
async function submitGeneration(prompt: string, width: number, height: number): Promise<SubmitResponse> {
  const submitUrl = `${BFL_BASE}${FLUX_2_PRO_PATH}`;
  const hasKey = !!(process.env.FLUX_API_KEY ?? process.env.BFL_API_KEY);
  console.info("[Flux] submit URL:", submitUrl, "| API key:", hasKey ? "set" : "missing");
  const res = await fetch(submitUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "x-key": getApiKey(),
    },
    body: JSON.stringify({
      prompt,
      width,
      height,
      output_format: "png",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Flux submit failed ${res.status}: ${err}`);
  }
  console.info("[Flux] submit OK, polling for result");
  return res.json() as Promise<SubmitResponse>;
}

/** Ensure polling URL is absolute (BFL may return relative path). */
function resolvePollingUrl(pollingUrl: string): string {
  if (pollingUrl.startsWith("http://") || pollingUrl.startsWith("https://")) return pollingUrl;
  const base = BFL_BASE.replace(/\/$/, "");
  const path = pollingUrl.startsWith("/") ? pollingUrl : `/${pollingUrl}`;
  return `${base}${path}`;
}

/** Poll until Ready or Error/Failed; returns result.sample URL or throws. */
async function pollUntilReady(pollingUrl: string, requestId: string): Promise<string> {
  const url = resolvePollingUrl(pollingUrl);
  const parsed = new URL(url);
  parsed.searchParams.set("id", requestId);
  const pollUrl = parsed.toString();
  console.info("[Flux] poll URL (resolved):", pollUrl);
  const started = Date.now();
  while (Date.now() - started < POLL_TIMEOUT_MS) {
    const res = await fetch(pollUrl, {
      headers: { accept: "application/json", "x-key": getApiKey() },
    });
    if (!res.ok) throw new Error(`Flux poll failed ${res.status}`);
    const data = (await res.json()) as PollResponse;
    if (data.status === "Ready" && data.result?.sample) return data.result.sample;
    if (data.status === "Error" || data.status === "Failed") {
      throw new Error(data.error ?? `Flux generation ${data.status}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("Flux polling timeout");
}

/** Fetch image from URL and return as base64 data URL. */
async function fetchImageAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Flux image fetch failed ${res.status}`);
  const buf = await res.arrayBuffer();
  const base64 = Buffer.from(buf).toString("base64");
  const contentType = res.headers.get("content-type") ?? "image/png";
  return `data:${contentType};base64,${base64}`;
}

/**
 * Generate one outfit image via FLUX 2 Pro.
 * Returns data URL (e.g. data:image/png;base64,...) or null on failure.
 */
export async function generateOutfitImage(prompt: string): Promise<string | null> {
  try {
    const { id, polling_url } = await submitGeneration(prompt, 768, 1024);
    const imageUrl = await pollUntilReady(polling_url, id);
    return await fetchImageAsDataUrl(imageUrl);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("[Flux] generateOutfitImage failed:", msg);
    if (stack) console.error("[Flux] stack:", stack);
    return null;
  }
}

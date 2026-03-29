import type { WardrobeResult } from "./types";

/** Drop base64 image payloads for API transport (Gemini path strips these anyway). */
export function stripWardrobeImageDataUrls(wardrobe: WardrobeResult): WardrobeResult {
  return {
    ...wardrobe,
    outfits: wardrobe.outfits.map(({ imageDataUrl: _, ...outfit }) => outfit),
  };
}

import { NextRequest, NextResponse } from "next/server";
import { buildWardrobe, getOutfitImagePrompts } from "@/lib/gemini";
import { generateOutfitImage } from "@/lib/flux";
import type { MetaInput, ColorTypeResult, ProfileResult, ArchetypeResult } from "@/lib/types";

const OUTFIT_IMAGE_CONCURRENCY = 2;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meta, colorType, profile, archetype } = body as {
      meta: MetaInput;
      colorType: ColorTypeResult;
      profile: ProfileResult;
      archetype: ArchetypeResult;
    };

    if (!meta || !colorType || !profile || !archetype) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await buildWardrobe(meta, colorType, profile, archetype);
    console.info("[wardrobe] buildWardrobe done, outfits count:", result.outfits.length);

    if (result.outfits.length > 0) {
      const gender = meta.gender ?? "neutral";
      let prompts: string[];
      try {
        prompts = await getOutfitImagePrompts(result.outfits, gender);
        console.info("[wardrobe] getOutfitImagePrompts done, prompts count:", prompts.length);
      } catch (e) {
        console.warn("[wardrobe] Outfit image prompts failed, skipping images:", e instanceof Error ? e.message : e);
        if (e instanceof Error && e.stack) console.warn("[wardrobe] getOutfitImagePrompts stack:", e.stack);
        return NextResponse.json(result);
      }

      const n = result.outfits.length;
      console.info("[wardrobe] Starting Flux generation for", n, "outfits (concurrency", OUTFIT_IMAGE_CONCURRENCY, ")");
      let generated = 0;
      const runOne = async (idx: number) => {
        const url = await generateOutfitImage(prompts[idx]);
        if (url) {
          result.outfits[idx].imageDataUrl = url;
          generated++;
        }
      };

      for (let i = 0; i < result.outfits.length; i += OUTFIT_IMAGE_CONCURRENCY) {
        const chunk = result.outfits
          .slice(i, i + OUTFIT_IMAGE_CONCURRENCY)
          .map((_, j) => runOne(i + j));
        await Promise.all(chunk);
      }
      console.info("[wardrobe] Flux generation done, generated:", generated, "/", n);
      if (generated === 0) {
        console.warn("[wardrobe] No outfit images generated; check server logs for [Flux] errors.");
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("/api/wardrobe error:", err);
    return NextResponse.json({ error: "Failed to build wardrobe" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { buildGuide } from "@/lib/gemini";
import { getImageForReference } from "@/lib/reference-images";
import type {
  MetaInput,
  ColorTypeResult,
  ProfileResult,
  ArchetypeResult,
  WardrobeResult,
} from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meta, colorType, profile, archetype, wardrobe } = body as {
      meta: MetaInput;
      colorType: ColorTypeResult;
      profile: ProfileResult;
      archetype: ArchetypeResult;
      wardrobe: WardrobeResult;
    };

    if (!meta || !colorType || !profile || !archetype || !wardrobe) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await buildGuide(meta, colorType, profile, archetype, wardrobe);

    // Enrich references with image URLs (SerpApi); cache avoids quota overuse
    const imageUrls = await Promise.all(
      result.references.map((ref) => getImageForReference(ref.name))
    );
    result.references.forEach((ref, i) => {
      const url = imageUrls[i];
      if (url) ref.imageUrl = url;
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("/api/guide error:", err);
    return NextResponse.json({ error: "Failed to build guide" }, { status: 500 });
  }
}

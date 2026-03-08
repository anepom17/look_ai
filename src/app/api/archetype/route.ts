import { NextRequest, NextResponse } from "next/server";
import { getArchetypeRecommendations, buildStyleVector } from "@/lib/gemini";
import type {
  MetaInput,
  ColorTypeResult,
  ProfileResult,
  ArchetypeId,
} from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subtask, meta, colorType, profile, selection } = body as {
      subtask: "A" | "B";
      meta: MetaInput;
      colorType: ColorTypeResult;
      profile: ProfileResult;
      selection?: { primary: ArchetypeId; secondary: ArchetypeId | null };
    };

    if (!subtask || !meta || !colorType || !profile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (subtask === "A") {
      const result = await getArchetypeRecommendations(meta, colorType, profile);
      return NextResponse.json(result);
    }

    if (subtask === "B") {
      if (!selection) {
        return NextResponse.json({ error: "Missing selection for subtask B" }, { status: 400 });
      }
      const result = await buildStyleVector(meta, colorType, profile, selection);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid subtask" }, { status: 400 });
  } catch (err) {
    console.error("/api/archetype error:", err);
    return NextResponse.json({ error: "Failed to process archetype" }, { status: 500 });
  }
}

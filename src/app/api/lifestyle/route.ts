import { NextRequest, NextResponse } from "next/server";
import { buildLifestyleProfile } from "@/lib/gemini";
import type { MetaInput, ColorTypeResult, LifestyleAnswers } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meta, colorType, answers } = body as {
      meta: MetaInput;
      colorType: Pick<ColorTypeResult, "season" | "temperature">;
      answers: LifestyleAnswers;
    };

    if (!meta || !colorType || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await buildLifestyleProfile(meta, colorType, answers);
    return NextResponse.json(result);
  } catch (err) {
    console.error("/api/lifestyle error:", err);
    return NextResponse.json({ error: "Failed to build lifestyle profile" }, { status: 500 });
  }
}

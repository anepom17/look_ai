import { NextRequest, NextResponse } from "next/server";
import { determineColorType, determineColorTypePreliminary, determineColorTypeFinal } from "@/lib/gemini";
import type { ColorTypeQuizAnswers, ColorTypeResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Phase 1: quiz only → preliminary + photo request
    if (body.answers != null && body.gender != null) {
      const { answers, gender } = body as { answers: ColorTypeQuizAnswers; gender: string };
      const result = await determineColorTypePreliminary(answers, gender);
      return NextResponse.json(result);
    }

    // Phase 2: preliminary + photos → final color type
    if (body.preliminaryResult != null && body.selfiePhoto != null) {
      const {
        preliminaryResult,
        selfiePhoto,
        wristPhoto,
      } = body as {
        preliminaryResult: ColorTypeResult;
        selfiePhoto: { base64: string; mimeType: string };
        wristPhoto?: { base64: string; mimeType: string };
      };
      const result = await determineColorTypeFinal(preliminaryResult, selfiePhoto, wristPhoto);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Missing required fields: either (answers, gender) or (preliminaryResult, selfiePhoto)" },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("/api/colortype error:", err);
    return NextResponse.json(
      { error: "Failed to determine color type", details: message },
      { status: 500 }
    );
  }
}

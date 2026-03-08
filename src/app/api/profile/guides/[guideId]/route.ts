import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGuideById } from "@/lib/db";

const COOKIE_NAME = "LOOKAI_PROFILE_ID";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ guideId: string }> }
) {
  try {
    const { guideId } = await params;
    const cookieStore = await cookies();
    const profileId = cookieStore.get(COOKIE_NAME)?.value ?? null;
    if (!profileId) {
      return NextResponse.json({ error: "No profile" }, { status: 401 });
    }
    const payload = getGuideById(guideId, profileId);
    if (!payload) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }
    const data = JSON.parse(payload);
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/profile/guides/[guideId] error:", err);
    return NextResponse.json({ error: "Failed to load guide" }, { status: 500 });
  }
}

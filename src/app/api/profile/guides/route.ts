import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { profileExists, insertGuide, getGuidesByProfileId } from "@/lib/db";
import type { WardrobeResult, GuideResult } from "@/lib/types";

const COOKIE_NAME = "LOOKAI_PROFILE_ID";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const profileId = cookieStore.get(COOKIE_NAME)?.value ?? null;
    if (!profileId) {
      return NextResponse.json({ error: "No profile", guides: [] }, { status: 200 });
    }
    if (!profileExists(profileId)) {
      return NextResponse.json({ guides: [] });
    }
    const guides = getGuidesByProfileId(profileId);
    return NextResponse.json({ guides });
  } catch (err) {
    console.error("GET /api/profile/guides error:", err);
    return NextResponse.json({ error: "Failed to list guides" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    let profileId = cookieStore.get(COOKIE_NAME)?.value ?? null;
    if (!profileId) {
      return NextResponse.json({ error: "No profile. Call POST /api/profile first." }, { status: 401 });
    }
    if (!profileExists(profileId)) {
      return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
    }

    const existing = getGuidesByProfileId(profileId);
    if (existing.length >= 2) {
      return NextResponse.json(
        {
          error: "Guide limit reached",
          message:
            "Вы уже сохранили максимум 2 гайда для этого профиля. Напишите разработчику, если нужен больший лимит.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { meta, colorType, profile, archetype, wardrobe, guide } = body as {
      meta: { name?: string | null };
      colorType: unknown;
      profile: unknown;
      archetype: unknown;
      wardrobe: WardrobeResult;
      guide: GuideResult;
    };
    if (!meta || !colorType || !profile || !archetype || !wardrobe || !guide) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = JSON.stringify({
      meta,
      colorType,
      profile,
      archetype,
      wardrobe,
      guide,
    });
    const title = guide.guideTitle || (meta.name ? `Гид — ${meta.name}` : "Гид по стилю");
    const guideId = crypto.randomUUID();
    insertGuide(guideId, profileId, title, payload);

    return NextResponse.json({ guideId, title });
  } catch (err) {
    console.error("POST /api/profile/guides error:", err);
    return NextResponse.json({ error: "Failed to save guide" }, { status: 500 });
  }
}

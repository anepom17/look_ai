import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureProfile, profileExists } from "@/lib/db";

const COOKIE_NAME = "LOOKAI_PROFILE_ID";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function POST() {
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get(COOKIE_NAME)?.value;

    if (existing && profileExists(existing)) {
      return NextResponse.json({ profileId: existing });
    }

    const profileId = crypto.randomUUID();
    ensureProfile(profileId);

    const res = NextResponse.json({ profileId });
    res.cookies.set(COOKIE_NAME, profileId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("/api/profile error:", err);
    return NextResponse.json({ error: "Failed to get or create profile" }, { status: 500 });
  }
}

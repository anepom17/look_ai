import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { StyleGuidePDF } from "@/lib/pdf";
import type {
  MetaInput,
  ColorTypeResult,
  ProfileResult,
  ArchetypeResult,
  WardrobeResult,
  GuideResult,
} from "@/lib/types";
import React, { type JSXElementConstructor, type ReactElement } from "react";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meta, colorType, profile, archetype, wardrobe, guide } = body as {
      meta: MetaInput;
      colorType: ColorTypeResult;
      profile: ProfileResult;
      archetype: ArchetypeResult;
      wardrobe: WardrobeResult;
      guide: GuideResult;
    };

    if (!meta || !colorType || !profile || !archetype || !wardrobe || !guide) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const element = React.createElement(StyleGuidePDF, {
      meta,
      colorType,
      profile,
      archetype,
      wardrobe,
      guide,
    }) as unknown as ReactElement<DocumentProps, JSXElementConstructor<DocumentProps>>;

    const buffer = await renderToBuffer(element);
    const uint8: Uint8Array =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer);

    const filename = meta.name
      ? `guide-${meta.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "style-guide.pdf";

    // RFC 5987: filename= must be ASCII-safe; filename*= carries UTF-8 encoded value
    // This fixes "Cannot convert argument to ByteString" on Cyrillic names in Content-Disposition
    const asciiFilename = "style-guide.pdf";
    const encodedFilename = encodeURIComponent(filename);
    const contentDisposition = `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`;

    return new NextResponse(uint8 as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": String(uint8.byteLength),
      },
    });
  } catch (err) {
    console.error("/api/pdf error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}

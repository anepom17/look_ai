import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { StyleGuidePDF } from "@/lib/pdf";
import { pdfFixture } from "@/lib/pdf-fixture";
import React, { type JSXElementConstructor, type ReactElement } from "react";

/**
 * GET /api/pdf-preview — generates a sample PDF from fixture data (no AI calls).
 * Use to verify PDF layout, fonts, and that there are no blank pages.
 *
 * Usage:
 *   1. Run: npm run dev
 *   2. Open: http://localhost:3000/api/pdf-preview
 *   3. Browser will download or display the PDF (guide-andrey.pdf)
 *
 * Or save to file:
 *   curl -o test-layout.pdf http://localhost:3000/api/pdf-preview
 */
export async function GET() {
  try {
    const { meta, colorType, profile, archetype, wardrobe, guide } = pdfFixture;

    const element = React.createElement(StyleGuidePDF, {
      meta,
      colorType,
      profile,
      archetype,
      wardrobe,
      guide,
    }) as unknown as ReactElement<
      DocumentProps,
      JSXElementConstructor<DocumentProps>
    >;

    const buffer = await renderToBuffer(element);
    const uint8: Uint8Array =
      buffer instanceof Uint8Array
        ? buffer
        : new Uint8Array(buffer as ArrayBuffer);

    const filename = meta.name
      ? `guide-${meta.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "style-guide.pdf";

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
    console.error("/api/pdf-preview error:", err);
    return NextResponse.json(
      { error: "Failed to generate preview PDF" },
      { status: 500 }
    );
  }
}

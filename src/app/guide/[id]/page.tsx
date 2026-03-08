"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Step4Results } from "@/components/wizard/Step4Results";
import type {
  MetaInput,
  ColorTypeResult,
  ProfileResult,
  ArchetypeResult,
  WardrobeResult,
  GuideResult,
} from "@/lib/types";

interface GuidePayload {
  meta: MetaInput;
  colorType: ColorTypeResult;
  profile: ProfileResult;
  archetype: ArchetypeResult;
  wardrobe: WardrobeResult;
  guide: GuideResult;
}

export default function GuidePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const [data, setData] = useState<GuidePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No guide id");
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/profile/guides/${id}`, { credentials: "same-origin" });
        if (!res.ok) {
          if (res.status === 404) setError("Гайд не найден");
          else setError("Не удалось загрузить гайд");
          return;
        }
        const payload = await res.json();
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setError("Ошибка загрузки");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDownloadPDF() {
    if (!data) return;
    setIsGeneratingPDF(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: data.meta,
          colorType: data.colorType,
          profile: data.profile,
          archetype: data.archetype,
          wardrobe: data.wardrobe,
          guide: data.guide,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.meta.name
        ? `guide-${data.meta.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
        : "style-guide.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Ошибка при генерации PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <p className="text-sm text-zinc-500">Загрузка гайда…</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <p className="text-sm text-zinc-600 mb-4">{error ?? "Гайд не найден"}</p>
          <Link href="/my-guides" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← К моим гайдам
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/my-guides" className="text-xs text-zinc-400 hover:text-zinc-600">
            ← Мои гайды
          </Link>
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600">
            Создать новый
          </Link>
        </div>
        <div className="scale-in">
          <Step4Results
            meta={data.meta}
            colorType={data.colorType}
            profile={data.profile}
            archetype={data.archetype}
            wardrobe={data.wardrobe}
            guide={data.guide}
            isGeneratingPDF={isGeneratingPDF}
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </div>
    </main>
  );
}

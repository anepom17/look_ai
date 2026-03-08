"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PaletteStrip, ColorSwatch } from "@/components/ui/ColorSwatch";
import type {
  ColorTypeResult,
  ProfileResult,
  ArchetypeResult,
  WardrobeResult,
  GuideResult,
  MetaInput,
} from "@/lib/types";

interface Step4Props {
  meta: MetaInput;
  colorType: ColorTypeResult;
  profile: ProfileResult;
  archetype: ArchetypeResult;
  wardrobe: WardrobeResult;
  guide: GuideResult;
  isGeneratingPDF: boolean;
  onDownloadPDF: () => void;
}

type Tab = "color" | "archetype" | "wardrobe" | "outfits" | "guide";

export function Step4Results({
  meta,
  colorType,
  profile,
  archetype,
  wardrobe,
  guide,
  isGeneratingPDF,
  onDownloadPDF,
}: Step4Props) {
  const [activeTab, setActiveTab] = useState<Tab>("color");

  const TABS: { id: Tab; label: string }[] = [
    { id: "color", label: "Цветотип" },
    { id: "archetype", label: "Архетип" },
    { id: "wardrobe", label: "Гардероб" },
    { id: "outfits", label: "Образы" },
    { id: "guide", label: "Гайд" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Готово</p>
        <h2 className="text-2xl font-bold text-zinc-900">
          {meta.name ? `Гид по гардеробу — ${meta.name}` : "Ваш гид по гардеробу"}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          {colorType.season} · {archetype.primary.name}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "color" && (
          <div className="space-y-6">
            <div>
              <p className="text-xl font-bold text-zinc-900 mb-2">{colorType.season}</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{colorType.description}</p>
            </div>
            <PaletteStrip colors={colorType.palette.neutral} label="Базовые нейтральные" />
            <PaletteStrip colors={colorType.palette.best} label="Акцентные цвета" />
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Чего избегать</p>
              <div className="flex flex-wrap gap-3">
                {colorType.palette.avoid.map((c, i) => (
                  <div key={`avoid-${i}-${c.hex ?? ""}`} className="relative">
                    <ColorSwatch color={c} />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                      <span className="text-white font-bold text-lg drop-shadow">×</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4">
              <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Металлы украшений</p>
              <p className="text-sm text-zinc-700">
                <span className="font-medium">✓ {colorType.metals.best}</span>
              </p>
              <p className="text-sm text-zinc-500">
                <span>✗ {colorType.metals.avoid}</span>
              </p>
              {colorType.makeupNote && (
                <p className="text-sm text-zinc-600 mt-3 pt-3 border-t border-zinc-200">
                  {colorType.makeupNote}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "archetype" && (
          <div className="space-y-5">
            <div>
              <p className="text-xl font-bold text-zinc-900 mb-1">
                {archetype.primary.name}
                {archetype.secondary && (
                  <span className="text-zinc-400 font-normal"> + {archetype.secondary.name}</span>
                )}
              </p>
              <p className="text-sm text-zinc-500 italic leading-relaxed">{archetype.vector}</p>
            </div>
            <div className="rounded-xl bg-zinc-900 text-white p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Формула образа</p>
              <p className="text-sm font-medium">{archetype.coreFormula}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
                Принципы стиля
              </p>
              <ol className="space-y-2">
                {archetype.principles.map((p, i) => (
                  <li key={i} className="flex gap-3 text-sm text-zinc-700">
                    <span className="text-zinc-300 font-medium flex-shrink-0">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            {profile.keyInsights.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
                  Ключевые наблюдения
                </p>
                <ul className="space-y-2">
                  {profile.keyInsights.map((insight, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-600">
                      <span className="text-zinc-300">→</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === "wardrobe" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-zinc-900 text-white px-5 py-4">
              <p className="text-sm font-medium italic">{wardrobe.universalRule}</p>
            </div>
            {wardrobe.capsule.map((item) => (
              <div
                key={item.number}
                className="rounded-xl border border-zinc-100 bg-white p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                      {item.number.toString().padStart(2, "0")}
                    </p>
                    <p className="font-semibold text-zinc-900 text-sm">{item.item}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{item.role}</p>
                    <p className="text-xs text-zinc-400 mt-0.5 italic">{item.silhouette}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 ml-3">
                    {item.colors.map((c, ci) => (
                      <div
                        key={`capsule-${item.number}-${ci}-${c.hex ?? ""}`}
                        className="w-6 h-6 rounded-full border border-black/10"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
                {item.avoid && (
                  <p className="text-xs text-zinc-400 border-t border-zinc-50 pt-2">
                    Избегать: {item.avoid}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "outfits" && (
          <div className="space-y-4">
            {wardrobe.outfits.map((outfit) => (
              <div
                key={outfit.context}
                className="rounded-xl border border-zinc-100 bg-white p-5 space-y-3"
              >
                {outfit.imageDataUrl && (
                  <div className="rounded-lg overflow-hidden border border-zinc-100 mb-3 flex justify-center bg-zinc-50">
                    <img
                      src={outfit.imageDataUrl}
                      alt={outfit.headline}
                      className="w-full max-h-[28rem] object-contain object-center"
                    />
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                    {outfit.context}
                  </p>
                  <p className="font-semibold text-zinc-900 text-sm">{outfit.headline}</p>
                </div>
                <div className="space-y-1.5">
                  {outfit.pieces.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="text-xs text-zinc-700">
                        {p.item} — {p.color}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 border border-zinc-200"
                      style={{ backgroundColor: outfit.shoes.hex }}
                    />
                    <span className="text-xs text-zinc-700">
                      {outfit.shoes.item} — {outfit.shoes.color}
                    </span>
                  </div>
                  {outfit.accessory && (
                    <p className="text-xs text-zinc-500 ml-5">+ {outfit.accessory}</p>
                  )}
                </div>
                <div className="pt-2 border-t border-zinc-50">
                  <p className="text-xs italic text-zinc-600">{outfit.formula}</p>
                  <p className="text-xs text-zinc-500 mt-1">{outfit.effect}</p>
                  {outfit.transition && (
                    <p className="text-xs text-zinc-400 mt-1.5">
                      Трансформация: {outfit.transition}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "guide" && (
          <div className="space-y-6">
            {/* References */}
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
                Стилевые ориентиры
              </p>
              <div className="space-y-3">
                {guide.references.map((ref, i) => (
                  <div key={i} className="rounded-xl border border-zinc-100 bg-white p-4">
                    <p className="font-semibold text-zinc-900 text-sm">{ref.name}</p>
                    <p className="text-xs text-zinc-400 mb-2">{ref.profession}</p>
                    <p className="text-xs text-zinc-600 mb-1">{ref.styleSimilarity}</p>
                    {ref.whatToAdopt.map((item, j) => (
                      <p key={j} className="text-xs text-zinc-500 ml-3">
                        → {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Personal rules */}
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
                Ваши личные правила
              </p>
              <div className="space-y-2">
                {guide.personalRules.map((rule, i) => (
                  <div
                    key={i}
                    className="rounded-xl border-l-2 border-zinc-900 bg-zinc-50 px-4 py-3"
                  >
                    <p className="text-sm text-zinc-800 font-medium leading-relaxed">{rule.rule}</p>
                    <p className="text-xs text-zinc-400 mt-1">{rule.context}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Download */}
      <div className="pt-4 border-t border-zinc-100">
        <Button
          onClick={onDownloadPDF}
          loading={isGeneratingPDF}
          size="lg"
          className="w-full"
        >
          {isGeneratingPDF ? "Генерируем PDF..." : "Скачать гид в PDF →"}
        </Button>
        <p className="text-xs text-center text-zinc-400 mt-2">
          Полный гайд по стилю в одном файле
        </p>
      </div>
    </div>
  );
}

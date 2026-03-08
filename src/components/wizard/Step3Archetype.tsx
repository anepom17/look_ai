"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ARCHETYPES } from "@/lib/types";
import type { ArchetypeId, ArchetypeRecommendationsResult } from "@/lib/types";

interface Step3Props {
  recommendations: ArchetypeRecommendationsResult;
  onComplete: (selection: { primary: ArchetypeId; secondary: ArchetypeId | null }) => void;
  isLoading: boolean;
}

const FIT_BADGE: Record<string, { label: string; className: string }> = {
  high: { label: "Отличное совпадение", className: "bg-zinc-900 text-white" },
  medium: { label: "Хорошее совпадение", className: "bg-zinc-100 text-zinc-700" },
  low: { label: "Слабое совпадение", className: "bg-zinc-50 text-zinc-400" },
};

export function Step3Archetype({ recommendations, onComplete, isLoading }: Step3Props) {
  const [primary, setPrimary] = useState<ArchetypeId | null>(null);
  const [secondary, setSecondary] = useState<ArchetypeId | null>(null);

  const canProceed = primary !== null;

  function handleSubmit() {
    if (!primary) return;
    onComplete({ primary, secondary });
  }

  const sortedRecs = [...recommendations.recommendations].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Ваш стилевой архетип</h2>
        <p className="text-zinc-500 text-sm">
          Выберите один основной архетип и при желании — вспомогательный
        </p>
      </div>

      {recommendations.note && (
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-5 py-4">
          <p className="text-sm text-zinc-600">{recommendations.note}</p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
          Основной архетип
        </p>
        {sortedRecs.map((rec) => {
          const archetype = ARCHETYPES[rec.archetypeId];
          const badge = FIT_BADGE[rec.fitScore];
          const isSelected = primary === rec.archetypeId;

          return (
            <button
              key={rec.archetypeId}
              onClick={() => {
                setPrimary(rec.archetypeId);
                if (secondary === rec.archetypeId) setSecondary(null);
              }}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-semibold text-sm ${isSelected ? "text-white" : "text-zinc-900"}`}>
                      {archetype.nameRu}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isSelected ? "bg-white/20 text-white" : badge.className
                      }`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className={`text-xs mb-2 ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                    {archetype.keywords.join(" · ")}
                  </p>
                  <p className={`text-xs leading-relaxed ${isSelected ? "text-zinc-200" : "text-zinc-600"}`}>
                    {archetype.description}
                  </p>
                  <p className={`text-xs mt-2 font-medium italic ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                    Формула: {archetype.formula}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${
                    isSelected ? "border-white" : "border-zinc-300"
                  }`}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
              </div>

              {/* AI reason */}
              <div
                className={`mt-3 pt-3 border-t text-xs italic ${
                  isSelected ? "border-white/20 text-zinc-300" : "border-zinc-100 text-zinc-400"
                }`}
              >
                {rec.reason}
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary archetype */}
      {primary && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
            Вспомогательный архетип{" "}
            <span className="text-zinc-300 normal-case tracking-normal">(опционально)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(ARCHETYPES) as ArchetypeId[])
              .filter((id) => id !== primary)
              .map((id) => {
                const a = ARCHETYPES[id];
                const isSelected = secondary === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSecondary(isSelected ? null : id)}
                    className={`px-4 py-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <p className="text-xs font-medium">{a.nameRu}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                      {a.keywords.slice(0, 2).join(", ")}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canProceed || isLoading}
        loading={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? "Формируем стилевой вектор..." : "Сформировать стиль →"}
      </Button>
    </div>
  );
}

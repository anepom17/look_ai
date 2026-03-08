"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/wizard/ProgressBar";
import { Step0Meta } from "@/components/wizard/Step0Meta";
import { Step1ColorType } from "@/components/wizard/Step1ColorType";
import { Step2Lifestyle } from "@/components/wizard/Step2Lifestyle";
import { Step3Archetype } from "@/components/wizard/Step3Archetype";
import { Step4Results } from "@/components/wizard/Step4Results";
import type {
  WizardState,
  MetaInput,
  ColorTypeQuizAnswers,
  ColorTypePreliminaryResponse,
  LifestyleAnswers,
  ArchetypeId,
} from "@/lib/types";

const TOTAL_STEPS = 6;

const initialState: WizardState = {
  currentStep: 0,
  isLoading: false,
  error: null,
  meta: null,
  colorTypeAnswers: null,
  colorTypePreliminary: null,
  colorType: null,
  lifestyleAnswers: null,
  profile: null,
  archetypeRecommendations: null,
  archetypeSelection: null,
  archetype: null,
  wardrobe: null,
  guide: null,
};

async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    const msg = err.details ? `${err.error}: ${err.details}` : (err.error || `API error ${res.status}`);
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export default function Home() {
  const [state, setState] = useState<WizardState>(initialState);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  function setLoading(isLoading: boolean) {
    setState((s) => ({ ...s, isLoading, error: null }));
  }

  function setError(error: string) {
    setState((s) => ({ ...s, isLoading: false, error }));
  }

  // ─── Step 0 → Step 1 ──────────────────────────────────────────────────────

  function handleMetaComplete(meta: MetaInput) {
    setState((s) => ({ ...s, meta, currentStep: 1 }));
  }

  // ─── Step 1 (phase 1: quiz → preliminary; phase 2: photos or skip → step 2) ───

  async function handleColorTypeComplete(answers: ColorTypeQuizAnswers) {
    if (!state.meta) return;
    setLoading(true);
    try {
      const res = await apiPost<ColorTypePreliminaryResponse>("colortype", {
        answers,
        gender: state.meta.gender,
      });
      setState((s) => ({
        ...s,
        colorTypeAnswers: answers,
        colorTypePreliminary: res,
        isLoading: false,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при определении цветотипа");
    }
  }

  async function handleColorTypePhotoSubmit(
    selfiePhoto: { base64: string; mimeType: string },
    wristPhoto?: { base64: string; mimeType: string }
  ) {
    if (!state.colorTypePreliminary) return;
    setLoading(true);
    try {
      const colorType = await apiPost("colortype", {
        preliminaryResult: state.colorTypePreliminary.preliminaryResult,
        selfiePhoto,
        ...(wristPhoto && { wristPhoto }),
      });
      setState((s) => ({
        ...s,
        colorType: colorType as WizardState["colorType"],
        colorTypePreliminary: null,
        isLoading: false,
        currentStep: 2,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при уточнении цветотипа по фото");
    }
  }

  function handleColorTypeSkip() {
    if (!state.colorTypePreliminary) return;
    setState((s) => ({
      ...s,
      colorType: s.colorTypePreliminary!.preliminaryResult,
      colorTypePreliminary: null,
      currentStep: 2,
    }));
  }

  // ─── Step 2 → Step 3 ──────────────────────────────────────────────────────

  async function handleLifestyleComplete(answers: LifestyleAnswers) {
    if (!state.meta || !state.colorType) return;
    setLoading(true);
    try {
      // Run lifestyle and archetype recommendations in parallel
      const [profile, archetypeRecommendations] = await Promise.all([
        apiPost("lifestyle", {
          meta: state.meta,
          colorType: {
            season: state.colorType.season,
            temperature: state.colorType.temperature,
          },
          answers,
        }),
        apiPost("archetype", {
          subtask: "A",
          meta: state.meta,
          colorType: state.colorType,
          profile: { dresscode: answers.dresscode, styleGoal: answers.styleGoal, mobility: answers.mobility, keyInsights: [] },
        }),
      ]);
      setState((s) => ({
        ...s,
        lifestyleAnswers: answers,
        profile: profile as WizardState["profile"],
        archetypeRecommendations: archetypeRecommendations as WizardState["archetypeRecommendations"],
        isLoading: false,
        currentStep: 3,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при обработке профиля");
    }
  }

  // ─── Step 3 → Step 4 ──────────────────────────────────────────────────────

  async function handleArchetypeComplete(selection: {
    primary: ArchetypeId;
    secondary: ArchetypeId | null;
  }) {
    if (!state.meta || !state.colorType || !state.profile) return;
    setLoading(true);
    try {
      const archetype = await apiPost("archetype", {
        subtask: "B",
        meta: state.meta,
        colorType: state.colorType,
        profile: state.profile,
        selection,
      });
      setState((s) => ({
        ...s,
        archetypeSelection: selection,
        archetype: archetype as WizardState["archetype"],
        isLoading: false,
        currentStep: 4,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при формировании архетипа");
    }
  }

  // ─── Step 4: Build wardrobe + guide ────────────────────────────────────────

  async function buildWardrobeAndGuide() {
    if (!state.meta || !state.colorType || !state.profile || !state.archetype) return;
    setLoading(true);
    try {
      const wardrobe = await apiPost("wardrobe", {
        meta: state.meta,
        colorType: state.colorType,
        profile: state.profile,
        archetype: state.archetype,
      });

      const guide = await apiPost("guide", {
        meta: state.meta,
        colorType: state.colorType,
        profile: state.profile,
        archetype: state.archetype,
        wardrobe,
      });

      setState((s) => ({
        ...s,
        wardrobe: wardrobe as WizardState["wardrobe"],
        guide: guide as WizardState["guide"],
        isLoading: false,
        currentStep: 5,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при создании гардероба");
    }
  }

  // Trigger wardrobe+guide build when we land on step 4
  const [wardrobeBuildTriggered, setWardrobeBuildTriggered] = useState(false);
  if (
    state.currentStep === 4 &&
    !state.wardrobe &&
    !state.isLoading &&
    !wardrobeBuildTriggered
  ) {
    setWardrobeBuildTriggered(true);
    buildWardrobeAndGuide();
  }

  // ─── PDF Download ──────────────────────────────────────────────────────────

  async function handleDownloadPDF() {
    if (!state.meta || !state.colorType || !state.profile || !state.archetype || !state.wardrobe || !state.guide) return;
    setIsGeneratingPDF(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta: state.meta,
          colorType: state.colorType,
          profile: state.profile,
          archetype: state.archetype,
          wardrobe: state.wardrobe,
          guide: state.guide,
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = state.meta.name
        ? `guide-${state.meta.name.toLowerCase()}.pdf`
        : "style-guide.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при генерации PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  const displayStep = Math.min(state.currentStep, TOTAL_STEPS - 1);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-zinc-400 uppercase">
              LookAI
            </p>
            <p className="text-[10px] text-zinc-300">Персональный гид по стилю</p>
          </div>
          {state.currentStep > 0 && (
            <button
              onClick={() => setState(initialState)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Начать заново
            </button>
          )}
        </div>

        {/* Progress */}
        {state.currentStep > 0 && state.currentStep < 5 && (
          <div className="mb-8">
            <ProgressBar currentStep={displayStep} totalSteps={TOTAL_STEPS} />
          </div>
        )}

        {/* Error */}
        {state.error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}

        {/* Steps */}
        {state.currentStep === 0 && (
          <Step0Meta onComplete={handleMetaComplete} />
        )}

        {state.currentStep === 1 && (
          <Step1ColorType
            colorTypePreliminary={state.colorTypePreliminary}
            onComplete={handleColorTypeComplete}
            onPhotoSubmit={handleColorTypePhotoSubmit}
            onSkip={handleColorTypeSkip}
            isLoading={state.isLoading}
          />
        )}

        {state.currentStep === 2 && state.colorType && state.meta && (
          <Step2Lifestyle
            colorType={state.colorType}
            gender={state.meta.gender}
            onComplete={handleLifestyleComplete}
            isLoading={state.isLoading}
          />
        )}

        {state.currentStep === 3 && state.archetypeRecommendations && (
          <Step3Archetype
            recommendations={state.archetypeRecommendations}
            onComplete={handleArchetypeComplete}
            isLoading={state.isLoading}
          />
        )}

        {/* Step 4: building wardrobe */}
        {state.currentStep === 4 && (state.isLoading || !state.wardrobe) && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-12 h-12 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-zinc-900">Создаём ваш гардероб</p>
              <p className="text-sm text-zinc-400 mt-1">
                Подбираем вещи, формулы образов и референсы...
              </p>
            </div>
          </div>
        )}

        {/* Step 5: results */}
        {state.currentStep === 5 &&
          state.meta &&
          state.colorType &&
          state.profile &&
          state.archetype &&
          state.wardrobe &&
          state.guide && (
            <Step4Results
              meta={state.meta}
              colorType={state.colorType}
              profile={state.profile}
              archetype={state.archetype}
              wardrobe={state.wardrobe}
              guide={state.guide}
              isGeneratingPDF={isGeneratingPDF}
              onDownloadPDF={handleDownloadPDF}
            />
          )}

        {/* Landing — step 0 decoration */}
        {state.currentStep === 0 && (
          <div className="mt-12 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Цветотип", desc: "12-сезонная система" },
                { label: "Архетип", desc: "6 стилевых векторов" },
                { label: "Гайд PDF", desc: "Готовый документ" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-100 bg-white p-4 text-center"
                >
                  <p className="text-xs font-semibold text-zinc-900">{item.label}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-zinc-300">
              Без фото · Без регистрации · ~5 минут
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

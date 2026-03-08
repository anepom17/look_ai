"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import type { ColorTypeQuizAnswers, ColorTypePreliminaryResponse } from "@/lib/types";

const MAX_FILE_MB = 8;

interface Step1Props {
  colorTypePreliminary: ColorTypePreliminaryResponse | null;
  onComplete: (answers: ColorTypeQuizAnswers) => void;
  onPhotoSubmit: (selfiePhoto: { base64: string; mimeType: string }, wristPhoto?: { base64: string; mimeType: string }) => void;
  onSkip: () => void;
  isLoading: boolean;
}

type OptionSet = { value: string; label: string }[];

const HAIR_OPTIONS: OptionSet = [
  { value: "very_light", label: "Очень светлые / белокурые" },
  { value: "light_blonde", label: "Светлый блонд" },
  { value: "dark_blonde", label: "Тёмно-русые" },
  { value: "chestnut", label: "Шатен (без рыжины)" },
  { value: "dark_brown", label: "Тёмно-коричневые" },
  { value: "black", label: "Чёрные" },
  { value: "red_auburn", label: "Рыжие / каштаново-рыжие" },
  { value: "ash_grey", label: "Пепельные / седые" },
];

const EYE_OPTIONS: OptionSet = [
  { value: "blue", label: "Голубые" },
  { value: "grey", label: "Серые" },
  { value: "grey_green", label: "Серо-зелёные" },
  { value: "green", label: "Зелёные" },
  { value: "light_brown", label: "Карие (светлые, янтарные)" },
  { value: "dark_brown", label: "Тёмно-карие" },
  { value: "black", label: "Чёрные" },
];

const TAN_OPTIONS: OptionSet = [
  { value: "no_tan", label: "Почти не загораю, краснею" },
  { value: "light_pink", label: "Загораю слабо, розовато" },
  { value: "golden", label: "Загораю хорошо, золотисто" },
  { value: "olive_dark", label: "Быстро темнею, оливковый оттенок" },
];

const BLACK_OPTIONS: OptionSet = [
  { value: "graphic", label: "Выгляжу графично и чётко — образ более выразительный" },
  { value: "pale", label: "Выгляжу бледно или устало — чёрное «съедает»" },
  { value: "neutral", label: "Нейтрально — особого эффекта не замечаю" },
];

const CONTRAST_OPTIONS: OptionSet = [
  { value: "high", label: "Высокий — заметная разница (например, тёмные волосы + светлая кожа)" },
  { value: "medium", label: "Средний — умеренная разница" },
  { value: "low", label: "Низкий — всё примерно одного тона (и кожа, и волосы, и глаза)" },
];

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: OptionSet;
  value: string;
  onChange: (v: string) => void;
}) {
  const fieldId = label.replace(/\s+/g, "-").toLowerCase();
  
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-zinc-700">{label}</legend>
      <div className="grid grid-cols-1 gap-2" role="group" aria-labelledby={fieldId}>
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm motion-safe:transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 ${
              value === o.value
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
            }`}
            aria-pressed={value === o.value}
            role="radio"
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function readFileAsBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, base64] = dataUrl.split(",");
      const mimeType = header?.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      resolve({ base64: base64 ?? "", mimeType });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function Step1ColorType({ colorTypePreliminary, onComplete, onPhotoSubmit, onSkip, isLoading }: Step1Props) {
  const [hair, setHair] = useState("");
  const [eyes, setEyes] = useState("");
  const [jewelry, setJewelry] = useState<"silver" | "gold" | "">("");
  const [tan, setTan] = useState("");
  const [blackReaction, setBlackReaction] = useState<"graphic" | "pale" | "neutral" | "">("");
  const [contrast, setContrast] = useState<"high" | "medium" | "low" | "">("");
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [wristFile, setWristFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const wristInputRef = useRef<HTMLInputElement>(null);

  const canProceed = hair && eyes && jewelry && tan && blackReaction && contrast;

  function handleSubmit() {
    if (!canProceed) return;
    onComplete({
      hair,
      eyes,
      jewelry: jewelry as "silver" | "gold",
      tan,
      blackReaction: blackReaction as "graphic" | "pale" | "neutral",
      contrast: contrast as "high" | "medium" | "low",
    });
  }

  async function handlePhotoSubmit() {
    if (!selfieFile || !colorTypePreliminary) return;
    setUploadError(null);
    try {
      if (selfieFile.size > MAX_FILE_MB * 1024 * 1024) {
        setUploadError(`Размер селфи не больше ${MAX_FILE_MB} МБ`);
        return;
      }
      const selfiePhoto = await readFileAsBase64(selfieFile);
      let wristPhoto: { base64: string; mimeType: string } | undefined;
      if (wristFile) {
        if (wristFile.size > MAX_FILE_MB * 1024 * 1024) {
          setUploadError(`Размер фото запястья не больше ${MAX_FILE_MB} МБ`);
          return;
        }
        wristPhoto = await readFileAsBase64(wristFile);
      }
      onPhotoSubmit(selfiePhoto, wristPhoto);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Не удалось прочитать файл");
    }
  }

  // Phase 2: show preliminary result + photo request + upload or skip
  if (colorTypePreliminary) {
    const { preliminaryResult, photoRequest } = colorTypePreliminary;
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">Уточнение по фото</h2>
          <p className="text-zinc-600 text-sm">
            Предварительно: <strong>{preliminaryResult.season}</strong>. Для уточнения загрузите селфи по инструкции ниже.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-amber-50/50 p-4">
          <p className="text-sm font-medium text-zinc-800 mb-1">Инструкция для селфи</p>
          <p className="text-sm text-zinc-700">{photoRequest.selfieInstruction}</p>
        </div>
        {photoRequest.needWristJewelryPhoto && photoRequest.wristInstruction && (
          <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-800 mb-1">Дополнительно: фото запястья</p>
            <p className="text-sm text-zinc-700">{photoRequest.wristInstruction}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-700">Селфи при дневном свете (обязательно)</p>
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:text-white"
            onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
          />
          {selfieFile && <p className="text-xs text-zinc-500">Выбран файл: {selfieFile.name}</p>}
        </div>
        {photoRequest.needWristJewelryPhoto && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700">Фото запястья с украшениями (по желанию)</p>
            <input
              ref={wristInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="block w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-4 file:py-2 file:text-sm file:text-zinc-800"
              onChange={(e) => setWristFile(e.target.files?.[0] ?? null)}
            />
            {wristFile && <p className="text-xs text-zinc-500">Выбран файл: {wristFile.name}</p>}
          </div>
        )}
        {uploadError && (
          <ErrorAlert
            message="Ошибка при загрузке файла"
            details={uploadError}
            variant="error"
            onDismiss={() => setUploadError(null)}
            showDismiss={true}
          />
        )}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handlePhotoSubmit}
            disabled={!selfieFile || isLoading}
            loading={isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? "Анализируем фото..." : "Отправить фото и получить результат"}
          </Button>
          <Button
            onClick={onSkip}
            disabled={isLoading}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Пропустить, использовать предварительный результат
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-1">Определяем цветотип</h2>
        <p className="text-zinc-500 text-sm">
          Ответьте на 6 вопросов о вашей внешности. Затем можно загрузить селфи для уточнения (по запросу нейросети).
        </p>
      </div>

      <OptionGroup
        label="1. Натуральный цвет волос"
        options={HAIR_OPTIONS}
        value={hair}
        onChange={setHair}
      />

      <OptionGroup
        label="2. Цвет глаз"
        options={EYE_OPTIONS}
        value={eyes}
        onChange={setEyes}
      />

      {/* Jewelry */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-700">
          3. Какие украшения лучше смотрятся у лица?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "silver", label: "Серебро / белое золото" },
            { value: "gold", label: "Жёлтое золото / медь" },
          ].map((o) => (
            <button
              key={o.value}
              onClick={() => setJewelry(o.value as "silver" | "gold")}
              className={`px-4 py-3 rounded-lg border text-sm font-medium motion-safe:transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 ${
                jewelry === o.value
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400"
              }`}
              aria-pressed={jewelry === o.value}
              role="radio"
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <OptionGroup
        label="4. Как вы загораете?"
        options={TAN_OPTIONS}
        value={tan}
        onChange={setTan}
      />

      <OptionGroup
        label="5. Как выглядите в чёрной одежде рядом с лицом?"
        options={BLACK_OPTIONS}
        value={blackReaction}
        onChange={(v) => setBlackReaction(v as "graphic" | "pale" | "neutral")}
      />

      <OptionGroup
        label="6. Контраст вашей внешности (кожа / волосы / глаза)"
        options={CONTRAST_OPTIONS}
        value={contrast}
        onChange={(v) => setContrast(v as "high" | "medium" | "low")}
      />

      <Button
        onClick={handleSubmit}
        disabled={!canProceed || isLoading}
        loading={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? "Определяем цветотип..." : "Определить цветотип →"}
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { MetaInput, Gender } from "@/lib/types";

interface Step0Props {
  onComplete: (meta: MetaInput) => void;
}

const GENDERS: { value: Gender; label: string; desc: string }[] = [
  { value: "female", label: "Женский", desc: "Рекомендации для женского гардероба" },
  { value: "male", label: "Мужской", desc: "Рекомендации для мужского гардероба" },
  { value: "neutral", label: "Нейтральный", desc: "Гендерно-нейтральные рекомендации" },
];

export function Step0Meta({ onComplete }: Step0Props) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");

  const canProceed = gender !== null && age !== "" && Number(age) > 0;

  function handleSubmit() {
    if (!canProceed) return;
    onComplete({
      name: name.trim() || null,
      gender: gender!,
      age: Number(age),
    });
  }

  const ageError = age && (Number(age) < 10 || Number(age) > 99) ? "Возраст должен быть от 10 до 99" : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Давайте познакомимся</h2>
        <p className="text-zinc-500 text-sm">
          Несколько базовых сведений для персонализации гайда
        </p>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
            Имя <span className="text-zinc-400 font-normal">(опционально)</span>
          </label>
          {name && <span className="text-xs text-green-600">✓</span>}
        </div>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, Аня"
          maxLength={50}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm motion-safe:transition-all"
        />
        <p className="text-xs text-zinc-400">{name.length}/50</p>
      </div>

      {/* Age */}
      <fieldset className="space-y-2">
        <legend className="block text-sm font-medium text-zinc-700">Возраст</legend>
        <input
          id="age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="30"
          min={10}
          max={99}
          className={`w-full px-4 py-2.5 rounded-xl border text-[var(--foreground)] placeholder-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 text-sm motion-safe:transition-all ${
            ageError ? "border-[var(--error)] focus:ring-[var(--error)]" : "border-[var(--border-light)] focus:ring-[var(--accent-primary)]"
          }`}
          aria-invalid={ageError ? "true" : "false"}
          aria-describedby={ageError ? "age-error" : undefined}
        />
        {ageError && (
          <p id="age-error" className="text-xs text-red-600 fade-in">
            {ageError}
          </p>
        )}
      </fieldset>

      {/* Gender */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-zinc-700">Гендер</legend>
        <div className="grid grid-cols-1 gap-3">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value)}
              className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl border-2 text-left motion-safe:transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] ${
                gender === g.value
                  ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
                  : "border-[var(--border-light)] bg-white text-[var(--foreground)] hover:border-[var(--border-medium)]"
              }`}
              aria-pressed={gender === g.value}
              role="radio"
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  gender === g.value ? "border-white" : "border-zinc-300"
                }`}
                aria-hidden="true"
              >
                {gender === g.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{g.label}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    gender === g.value ? "text-zinc-300" : "text-zinc-500"
                  }`}
                >
                  {g.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </fieldset>

      <Button
        onClick={handleSubmit}
        disabled={!canProceed}
        size="lg"
        className="w-full"
      >
        Продолжить →
      </Button>
    </div>
  );
}

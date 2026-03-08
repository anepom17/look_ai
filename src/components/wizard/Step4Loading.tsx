"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/LoadingState";

type Phase = "capsule" | "outfits" | "guide";

const PHASES: { id: Phase; label: string; duration: number }[] = [
  { id: "capsule", label: "Анализируем базовый гардероб", duration: 120 }, // 2 min
  { id: "outfits", label: "Создаём комбинации образов", duration: 90 }, // 1.5 min
  { id: "guide", label: "Завершаем PDF гайд", duration: 30 }, // 30 sec
];

interface Step4LoadingProps {
  totalDuration?: number;
}

export function Step4Loading({ totalDuration = 240 }: Step4LoadingProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const totalPhases = PHASES.length;
  const currentPhase = PHASES[currentPhaseIndex];
  const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds);
  const phaseProgress = currentPhaseIndex > 0 ? 100 : Math.round((progress / totalDuration) * 100);

  // Simulate progress over time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // Update phase based on elapsed time
        let phaseIdx = 0;
        let cumulativeTime = 0;
        for (let i = 0; i < PHASES.length; i++) {
          cumulativeTime += PHASES[i].duration;
          if (next >= cumulativeTime) {
            phaseIdx = i + 1;
          }
        }
        setCurrentPhaseIndex(Math.min(phaseIdx, totalPhases - 1));

        // Update progress bar
        const percent = (next / totalDuration) * 100;
        setProgress(Math.min(percent, 99)); // Max 99% until done

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalDuration, totalPhases]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 fade-in">
      {/* Main loading indicator */}
      <LoadingState
        size="lg"
        message="Создаём ваш гардероб"
        submessage={`Фаза ${currentPhaseIndex + 1} из ${totalPhases}: ${currentPhase.label}`}
      />

      {/* Phase progress */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium text-zinc-700">Прогресс создания</span>
            <span className="text-xs font-medium text-zinc-500">{Math.round(progress)}%</span>
          </div>
          <div className="relative h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[var(--accent-primary)] rounded-full motion-safe:transition-all duration-700"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Прогресс создания гардероба"
            />
          </div>
        </div>

        {/* Time estimate */}
        <div className="text-center">
          <p className="text-sm text-zinc-600">
            Осталось примерно <span className="font-semibold">{formatTime(remainingSeconds)}</span>
          </p>
          <p className="text-xs text-zinc-400 mt-1">Время зависит от сложности профиля</p>
        </div>
      </div>

      {/* Sub-phases */}
      <div className="space-y-2">
        {PHASES.map((phase, i) => (
          <div
            key={phase.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg motion-safe:transition-colors ${
              i < currentPhaseIndex
                ? "bg-green-50 border border-green-100"
                : i === currentPhaseIndex
                ? "bg-[var(--background-secondary)] border border-[var(--border-light)]"
                : "bg-[var(--background-light)] border border-[var(--border-light)]"
            }`}
          >
            {i < currentPhaseIndex ? (
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-[var(--border-medium)] flex-shrink-0 flex items-center justify-center">
                {i === currentPhaseIndex && (
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] pulse-progress" />
                )}
              </div>
            )}
            <span className={`text-sm ${i <= currentPhaseIndex ? "text-[var(--foreground)] font-medium" : "text-[var(--foreground-tertiary)]"}`}>
              {phase.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

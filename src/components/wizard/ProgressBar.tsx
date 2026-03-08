"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = [
  "Профиль",
  "Цветотип",
  "Образ жизни",
  "Архетип",
  "Гардероб",
  "Гайд",
];

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percent = Math.round((currentStep / (totalSteps - 1)) * 100);

  return (
    <nav className="w-full" aria-label="Прогресс визарда">
      {/* Step labels */}
      <div className="flex justify-between mb-3 gap-1">
        {STEP_LABELS.slice(0, totalSteps).map((label, i) => (
          <span
            key={i}
            className={`text-[10px] font-medium tracking-widest uppercase motion-safe:transition-colors duration-300 flex-1 text-center ${
              i === currentStep
                ? "text-[var(--accent-primary)]"
                : i < currentStep
                ? "text-[var(--foreground-tertiary)]"
                : "text-[var(--border-light)]"
            }`}
            aria-current={i === currentStep ? "step" : undefined}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Bar */}
      <div className="relative h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[var(--accent-primary)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percent}% проходимого визарда`}
        />
      </div>

      {/* Step counter */}
      <div className="flex justify-between mt-2.5 text-[10px] text-zinc-400">
        <span>
          Шаг <span className="font-semibold text-zinc-600">{currentStep + 1}</span> из{" "}
          <span className="font-semibold text-zinc-600">{totalSteps}</span>
        </span>
        <span className="font-semibold text-zinc-600">{percent}%</span>
      </div>
    </nav>
  );
}

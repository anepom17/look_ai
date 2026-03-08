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
    <div className="w-full">
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {STEP_LABELS.slice(0, totalSteps).map((label, i) => (
          <span
            key={i}
            className={`text-[10px] font-medium tracking-wide uppercase transition-colors ${
              i === currentStep
                ? "text-zinc-900"
                : i < currentStep
                ? "text-zinc-400"
                : "text-zinc-200"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Bar */}
      <div className="relative h-1 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-zinc-900 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-zinc-400">
          Шаг {currentStep + 1} из {totalSteps}
        </span>
        <span className="text-[10px] text-zinc-400">{percent}%</span>
      </div>
    </div>
  );
}

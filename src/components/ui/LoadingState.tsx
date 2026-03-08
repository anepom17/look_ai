"use client";

interface LoadingStateProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  submessage?: string;
  variant?: "spinner" | "progress";
}

export function LoadingState({
  size = "md",
  message = "Загружаем...",
  submessage,
  variant = "spinner",
}: LoadingStateProps) {
  const spinnerSizes = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-2",
    lg: "w-16 h-16 border-3",
  };

  const containerSizes = {
    sm: "py-8 gap-2",
    md: "py-16 gap-3",
    lg: "py-24 gap-4",
  };

  const messageSizes = {
    sm: "text-sm font-medium",
    md: "text-base font-semibold",
    lg: "text-lg font-semibold",
  };

  const submessageSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center ${containerSizes[size]} motion-safe:animate-pulse`}
    >
      {variant === "spinner" && (
        <div
          className={`${spinnerSizes[size]} border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin`}
          aria-hidden="true"
        />
      )}

      {message && <p className={`text-[var(--foreground)] ${messageSizes[size]}`}>{message}</p>}

      {submessage && <p className={`text-[var(--foreground-tertiary)] ${submessageSizes[size]}`}>{submessage}</p>}
    </div>
  );
}

"use client";

import { Button } from "./Button";

interface ErrorAlertProps {
  message: string;
  details?: string;
  variant?: "error" | "warning";
  onRetry?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function ErrorAlert({
  message,
  details,
  variant = "error",
  onRetry,
  onDismiss,
  showDismiss = true,
}: ErrorAlertProps) {
  const bgColor = variant === "error" ? "bg-red-50 border-red-100" : "bg-yellow-50 border-yellow-100";
  const textColor = variant === "error" ? "text-[var(--error)]" : "text-yellow-700";
  const detailsColor = variant === "error" ? "text-[var(--error)]" : "text-yellow-600";
  const iconColor = variant === "error" ? "text-[var(--error)]" : "text-yellow-700";

  return (
    <div
      className={`rounded-xl border ${bgColor} px-4 py-4 fade-in`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
          {variant === "error" ? (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className={`font-semibold text-sm ${textColor}`}>{message}</p>
          {details && <p className={`text-xs mt-1 ${detailsColor}`}>{details}</p>}
        </div>

        {/* Actions */}
        {(onRetry || showDismiss) && (
          <div className="flex-shrink-0 ml-3 flex gap-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="secondary"
                size="sm"
                className="whitespace-nowrap"
              >
                Повторить
              </Button>
            )}
            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className={`text-xs font-medium ${textColor} hover:opacity-75 transition-opacity`}
              >
                Закрыть
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

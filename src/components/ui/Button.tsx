"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-ring";

  const variants = {
    primary:
      "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-dark)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:bg-[var(--accent-primary-light)] disabled:opacity-50 disabled:shadow-none disabled:hover:shadow-none disabled:cursor-not-allowed disabled:hover:-translate-y-0 motion-safe:transition-all",
    secondary:
      "bg-white text-[var(--foreground)] border border-[var(--border-light)] hover:bg-[var(--background-secondary)] hover:border-[var(--border-medium)] active:bg-[var(--background)] disabled:bg-[var(--background-light)] disabled:border-[var(--border-light)] disabled:text-[var(--foreground-tertiary)] disabled:cursor-not-allowed motion-safe:transition-all",
    ghost:
      "bg-transparent text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] active:bg-[var(--background)] disabled:text-[var(--foreground-tertiary)] disabled:cursor-not-allowed motion-safe:transition-all",
    danger:
      "bg-[var(--error)] text-white hover:opacity-90 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:shadow-none disabled:hover:shadow-none disabled:hover:-translate-y-0 motion-safe:transition-all",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-5 py-2.5 text-sm min-h-[40px]",
    lg: "px-7 py-3.5 text-base min-h-[48px] md:min-h-[44px]",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${
        loading ? "opacity-70" : ""
      } ${className}`}
      aria-busy={loading}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

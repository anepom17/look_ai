"use client";

import type { Color } from "@/lib/types";

interface ColorSwatchProps {
  color: Color;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function isValidHex(hex: unknown): hex is string {
  return typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function ColorSwatch({ color, size = "md", showLabel = true }: ColorSwatchProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  const hex = isValidHex(color.hex) ? color.hex : "#e5e5e5";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`${sizes[size]} rounded-full border border-black/10 shadow-sm`}
        style={{ backgroundColor: hex }}
        title={color.name || hex}
      />
      {showLabel && (
        <span className="text-[10px] text-zinc-500 text-center leading-tight max-w-[64px]">
          {color.name}
        </span>
      )}
    </div>
  );
}

interface PaletteStripProps {
  colors: Color[];
  label: string;
}

export function PaletteStrip({ colors, label }: PaletteStripProps) {
  const validColors = Array.isArray(colors)
    ? colors.filter((c) => c && isValidHex(c.hex))
    : [];
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{label}</p>
      {validColors.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {validColors.map((c, i) => (
            <ColorSwatch key={`${c.hex}-${i}`} color={c} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-400 italic">Палитра не загружена</p>
      )}
    </div>
  );
}

"use client";

import { clsx } from "clsx";

const THEMES = [
    { id: "minimal-light", label: "Minimal" },
    { id: "framed", label: "Framed" },
    { id: "full-bleed", label: "Full Bleed" },
] as const;

type ThemeId = "minimal-light" | "framed" | "full-bleed";

interface ThemeSelectorProps {
    value: ThemeId;
    onChange: (theme: ThemeId) => void;
}

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <span className="text-body-sm text-ink-secondary tracking-ui uppercase">
                Theme
            </span>
            <div
                role="radiogroup"
                aria-label="Postcard theme"
                className="flex overflow-x-auto gap-2 pb-0.5"
                style={{ scrollbarWidth: "none" }}
            >
                {THEMES.map((theme) => {
                    const selected = value === theme.id;
                    return (
                        <button
                            key={theme.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(theme.id)}
                            className={clsx(
                                "flex-shrink-0 px-4 py-2.5 text-body-sm tracking-ui transition-colors duration-150",
                                "border min-h-[44px] whitespace-nowrap",
                                selected
                                    ? "border-ink text-ink"
                                    : "border-divider text-ink-secondary hover:border-accent-muted"
                            )}
                        >
                            {theme.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

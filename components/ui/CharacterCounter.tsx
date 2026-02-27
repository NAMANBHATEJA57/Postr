"use client";

interface CharacterCounterProps {
    current: number;
    max: number;
    warnAt?: number;
}

export default function CharacterCounter({
    current,
    max,
    warnAt,
}: CharacterCounterProps) {
    const threshold = warnAt ?? Math.floor(max * 0.75);
    const isWarning = current >= threshold;
    const isOver = current > max;

    if (current < threshold) return null;

    return (
        <span
            aria-live="polite"
            className={`text-body-sm tabular-nums transition-colors ${isOver
                    ? "text-red-500"
                    : isWarning
                        ? "text-accent"
                        : "text-ink-secondary"
                }`}
        >
            {current}/{max}
        </span>
    );
}

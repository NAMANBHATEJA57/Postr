"use client";

import { useState } from "react";
import { ExpiryOption } from "@/types/postcard";

const EXPIRY_OPTIONS: { value: ExpiryOption; label: string }[] = [
    { value: "never", label: "Never expires" },
    { value: "24h", label: "24 hours" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "custom", label: "Custom date…" },
];

interface ExpirySelectorProps {
    value: ExpiryOption;
    customDate?: string;
    onChange: (option: ExpiryOption, customDate?: string) => void;
}

export default function ExpirySelector({
    value,
    customDate = "",
    onChange,
}: ExpirySelectorProps) {
    const [showDateInput, setShowDateInput] = useState(value === "custom");

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const option = e.target.value as ExpiryOption;
        setShowDateInput(option === "custom");
        onChange(option);
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <label
                htmlFor="expiry-select"
                className="text-body-sm text-ink-secondary tracking-ui uppercase"
            >
                Expires
            </label>
            <select
                id="expiry-select"
                value={value}
                onChange={handleSelect}
                className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none focus:border-ink transition-colors duration-150 appearance-none cursor-pointer min-h-[44px]"
            >
                {EXPIRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {showDateInput && (
                <input
                    type="date"
                    value={customDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => onChange("custom", e.target.value)}
                    className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none focus:border-ink transition-colors duration-150 min-h-[44px]"
                    aria-label="Custom expiry date"
                />
            )}
        </div>
    );
}

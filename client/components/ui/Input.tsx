"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, id, onFocus, onBlur, ...props }, ref) => {
        const [focused, setFocused] = useState(false);

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-body-sm text-ink-secondary"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={id}
                        onFocus={(e) => {
                            setFocused(true);
                            onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setFocused(false);
                            onBlur?.(e);
                        }}
                        className={clsx(
                            "w-full bg-transparent text-ink text-body-lg font-sans",
                            "border-b pb-2 outline-none",
                            "placeholder:text-accent-muted",
                            "transition-colors duration-150",
                            focused ? "border-[#C08497]" : "border-divider",
                            error && "border-red-400",
                            className
                        )}
                        {...props}
                    />
                    <span
                        className={clsx(
                            "absolute bottom-0 left-0 h-px bg-[#C08497] transition-all",
                            "duration-150 ease-out",
                            focused ? "w-full" : "w-0"
                        )}
                        aria-hidden="true"
                    />
                </div>
                {error && (
                    <p role="alert" className="text-body-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;

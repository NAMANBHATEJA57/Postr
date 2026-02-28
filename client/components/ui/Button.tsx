"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            disabled,
            children,
            className,
            ...props
        },
        ref
    ) => {
        const isDisabled = disabled || loading;

        const base =
            "inline-flex items-center justify-center font-sans tracking-ui transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent select-none";

        const variants = {
            primary: "bg-ink text-linen hover:opacity-80 disabled:opacity-40",
            ghost: "text-ink-secondary hover:text-ink hover:opacity-80",
            outline:
                "border border-divider text-ink hover:border-accent-muted disabled:opacity-40",
        };

        const sizes = {
            sm: "text-body-sm px-4 py-2 min-h-[40px]",
            md: "text-body-sm px-6 py-3 min-h-[44px]",
            lg: "text-body-lg px-8 py-4 min-h-[48px]",
        };

        return (
            <button
                ref={ref}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                className={clsx(base, variants[variant], sizes[size], className)}
                {...props}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Spinner />
                        <span>{children}</span>
                    </span>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

function Spinner() {
    return (
        <svg
            className="animate-spin h-4 w-4 text-current"
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
                d="M4 12a8 8 0 018-8v8H4z"
            />
        </svg>
    );
}

export default Button;

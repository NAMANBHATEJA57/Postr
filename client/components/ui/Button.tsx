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
            "inline-flex items-center justify-center font-sans tracking-ui select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C08497] focus-visible:ring-offset-1";

        const variants = {
            primary: "bg-ink text-linen hover-elevate disabled:opacity-45 disabled:pointer-events-none",
            ghost: "text-ink-secondary hover:text-ink transition-colors duration-150",
            outline:
                "border border-divider text-ink hover:bg-black/[.04] hover:border-[rgba(26,26,26,0.4)] disabled:opacity-40 transition-colors duration-150",
        };

        const sizes = {
            sm: "text-body-sm px-4 py-2 min-h-[40px]",
            md: "text-body-sm px-6 py-3 min-h-[44px]",
            lg: "text-[0.9375rem] px-8 py-4 min-h-[48px]",
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
        <span className="material-symbols-rounded animate-spin text-[18px]">
            progress_activity
        </span>
    );
}

export default Button;

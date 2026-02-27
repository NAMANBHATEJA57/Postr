"use client";

import { TextareaHTMLAttributes, forwardRef, useRef, useEffect } from "react";
import { clsx } from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, autoResize = true, className, id, ...props }, ref) => {
        const innerRef = useRef<HTMLTextAreaElement>(null);
        const resolvedRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? innerRef;

        // Auto-resize behaviour
        useEffect(() => {
            if (!autoResize) return;
            const el = resolvedRef.current;
            if (!el) return;
            const resize = () => {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
            };
            el.addEventListener("input", resize);
            resize();
            return () => el.removeEventListener("input", resize);
        }, [autoResize, resolvedRef]);

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="text-body-sm text-ink-secondary tracking-ui uppercase"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={resolvedRef}
                    id={id}
                    rows={3}
                    className={clsx(
                        "w-full bg-transparent text-ink text-body-lg font-sans resize-none",
                        "border-b border-divider pb-2 outline-none",
                        "placeholder:text-accent-muted",
                        "focus:border-ink transition-colors duration-150",
                        "overflow-hidden",
                        error && "border-red-400",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p role="alert" className="text-body-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export default Textarea;

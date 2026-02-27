"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface EnvelopeAnimationProps {
    toName: string;
    fromName: string;
    onOpen: () => void;
}

// Spec: 380ms total
// Phase 1: Flap rotate 0° → -110° — 180ms
// Phase 2: Fade envelope + scale 1→0.98 + fade content in — 200ms
// Easing: cubic-bezier(0.33, 1, 0.68, 1)
// Reduced motion: simple fade 200ms

const EASE = [0.33, 1, 0.68, 1] as const;

export default function EnvelopeAnimation({
    toName,
    fromName,
    onOpen,
}: EnvelopeAnimationProps) {
    const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
    const prefersReducedMotion = useReducedMotion();

    const handleTap = () => {
        if (phase !== "closed") return;
        setPhase("opening");

        if (prefersReducedMotion) {
            setTimeout(() => {
                setPhase("open");
                onOpen();
            }, 200);
        } else {
            // Phase 1 ends after 180ms, Phase 2 after 380ms total
            setTimeout(() => {
                setPhase("open");
                onOpen();
            }, 380);
        }
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-dvh px-6"
            aria-label="Tap the envelope to open your postcard"
        >
            <AnimatePresence>
                {phase !== "open" && (
                    <motion.div
                        key="envelope"
                        initial={{ opacity: 1, scale: 1 }}
                        animate={
                            phase === "opening"
                                ? prefersReducedMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.98, transition: { delay: 0.18, duration: 0.2, ease: EASE } }
                                : { opacity: 1, scale: 1 }
                        }
                        exit={{ opacity: 0 }}
                        className="w-full max-w-[min(340px,80vw)] cursor-pointer select-none"
                        onClick={handleTap}
                        onKeyDown={(e) => e.key === "Enter" && handleTap()}
                        tabIndex={0}
                        role="button"
                        aria-label="Open envelope"
                    >
                        {/* Envelope SVG */}
                        <svg
                            viewBox="0 0 340 230"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-auto"
                            aria-hidden="true"
                        >
                            {/* Body */}
                            <rect x="0" y="40" width="340" height="190" fill="#EDE9E4" />
                            {/* Left triangle fold */}
                            <polygon points="0,40 0,230 140,140" fill="#DDD8D2" />
                            {/* Right triangle fold */}
                            <polygon points="340,40 340,230 200,140" fill="#DDD8D2" />
                            {/* Bottom V crease */}
                            <polygon points="0,230 340,230 170,130" fill="#E8E3DD" />

                            {/* Flap — animated in phase "opening" */}
                            <motion.g
                                style={{ transformOrigin: "170px 40px", transformBox: "fill-box" }}
                                animate={
                                    phase === "opening" && !prefersReducedMotion
                                        ? { rotateX: -110, transition: { duration: 0.18, ease: EASE } }
                                        : { rotateX: 0 }
                                }
                            >
                                <polygon points="0,40 340,40 170,155" fill="#E8E3DD" />
                                <polygon points="0,40 340,40 170,155" fill="none" stroke="#C7C0B8" strokeWidth="0.5" />
                            </motion.g>

                            {/* Outline */}
                            <rect x="0.5" y="40.5" width="339" height="189" stroke="#C7C0B8" strokeWidth="1" />
                        </svg>

                        {/* To / From labels */}
                        <div className="mt-6 text-center space-y-1">
                            <p className="text-body-sm text-ink-secondary tracking-ui">
                                to{" "}
                                <span className="text-ink">{toName.toLowerCase()}</span>
                            </p>
                            <p className="text-body-sm text-accent-muted tracking-ui">
                                from {fromName.toLowerCase()}
                            </p>
                        </div>

                        <p className="mt-8 text-center text-body-sm text-accent-muted tracking-ui">
                            tap to open
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

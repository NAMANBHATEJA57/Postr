"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface EnvelopeAnimationProps {
    toName: string;
    fromName: string;
    onOpen: () => void;
}

const EASE = [0.33, 1, 0.68, 1] as const;
const DURATION = 0.34;

export default function EnvelopeAnimation({
    toName,
    fromName,
    onOpen,
}: EnvelopeAnimationProps) {
    const [phase, setPhase] = useState<"idle" | "leaving">("idle");
    const prefersReducedMotion = useReducedMotion();

    const handleTap = () => {
        if (phase !== "idle") return;
        setPhase("leaving");
        const delay = prefersReducedMotion ? 160 : DURATION * 1000 + 40;
        setTimeout(() => { onOpen(); }, delay);
    };

    return (
        <div
            className="flex flex-col items-center justify-center min-h-dvh px-6 text-center"
            aria-label="Tap the envelope to open your postcard"
        >
            <AnimatePresence>
                {phase === "idle" && (
                    <motion.div
                        key="envelope"
                        initial={{ opacity: 1, scale: 1, y: 0 }}
                        exit={
                            prefersReducedMotion
                                ? { opacity: 0 }
                                : {
                                    opacity: 0,
                                    scale: 0.98,
                                    y: -8,
                                    transition: { duration: DURATION, ease: EASE },
                                }
                        }
                        className="flex flex-col items-center w-full max-w-[min(340px,80vw)]"
                    >
                        {/* ── Headline ── */}
                        <p className="font-serif text-lg text-ink leading-[1.5] mb-5 text-center">
                            something from {fromName.toLowerCase()} is waiting.
                        </p>

                        {/* ── Envelope SVG — static, no flap animation ── */}
                        <motion.div
                            className="w-full cursor-pointer select-none mt-8"
                            onClick={handleTap}
                            onKeyDown={(e) => e.key === "Enter" && handleTap()}
                            tabIndex={0}
                            role="button"
                            aria-label="Open envelope"
                            data-testid="envelope"
                            whileHover={prefersReducedMotion ? {} : { rotate: 1.5, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <svg
                                viewBox="0 0 340 230"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-full h-auto"
                                aria-hidden="true"
                            >
                                <rect x="0" y="40" width="340" height="190" fill="#EDE9E4" />
                                <polygon points="0,40 0,230 140,140" fill="#DDD8D2" />
                                <polygon points="340,40 340,230 200,140" fill="#DDD8D2" />
                                <polygon points="0,230 340,230 170,130" fill="#E8E3DD" />
                                <polygon points="0,40 340,40 170,155" fill="#E8E3DD" />
                                <polygon
                                    points="0,40 340,40 170,155"
                                    fill="none"
                                    stroke="#C7C0B8"
                                    strokeWidth="0.5"
                                />
                                <rect
                                    x="0.5"
                                    y="40.5"
                                    width="339"
                                    height="189"
                                    stroke="#C7C0B8"
                                    strokeWidth="1"
                                />
                            </svg>

                            {/* Tap hint — quiet, not instructional */}
                            <p className="font-sans text-[13px] text-accent-muted tracking-[0.03em] opacity-75 mt-7 text-center">
                                tap to open
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

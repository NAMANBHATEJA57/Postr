"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface EnvelopeAnimationProps {
    toName: string;
    fromName: string;
    onOpen: () => void;
}

const EASE = [0.33, 1, 0.68, 1] as const;
const DURATION = 0.34;

export default function EnvelopeAnimation({
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
            className="flex flex-col items-center justify-start min-h-dvh px-6 text-center pt-16"
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
                        className="flex flex-col items-center w-full max-w-[min(640px,94vw)]"
                    >
                        {/* ── Logo ── */}
                        <Link href="/" className="flex items-center gap-2 mb-16 hover:opacity-80 transition-opacity">
                            <Image 
                                src="https://res.cloudinary.com/dqwd7hbl6/image/upload/f_auto,q_auto/v1776260207/Logo_kaarkv.png" 
                                alt="Dearly Logo" 
                                width={32} 
                                height={24} 
                                className="object-contain opacity-90" 
                                priority
                            />
                            <span className="font-serif text-[1.4rem] font-bold tracking-tight text-ink">Dearly</span>
                        </Link>

                        {/* ── Headline ── */}
                        <p className="font-serif text-[24px] text-ink leading-[1.5] mb-6 text-center">
                            something from {fromName.toLowerCase()} is waiting.
                        </p>

                        {/* ── Envelope Image ── */}
                        <motion.div
                            className="w-full cursor-pointer select-none relative max-w-[640px] mx-auto"
                            onClick={handleTap}
                            onKeyDown={(e) => e.key === "Enter" && handleTap()}
                            tabIndex={0}
                            role="button"
                            aria-label="Open envelope"
                            data-testid="envelope"
                            whileHover={prefersReducedMotion ? {} : { rotate: 0.5, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <img
                                src="https://res.cloudinary.com/dqwd7hbl6/image/upload/f_auto,q_auto/v1776325323/close_letter_h3bwbd.png"
                                alt="Sealed Envelope"
                                className="w-full h-auto drop-shadow-sm"
                            />

                            {/* Tap hint */}
                            <p className="font-sans text-[13px] text-ink/60 tracking-normal mt-2 text-center">
                                tap to open
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


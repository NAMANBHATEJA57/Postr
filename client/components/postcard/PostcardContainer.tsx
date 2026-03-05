"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import FrontSide from "./FrontSide";
import BackSide from "./BackSide";
import { ApiPostcardResponse } from "@/types/postcard";

interface PostcardContainerProps {
    postcard: ApiPostcardResponse;
}

/**
 * PostcardContainer — handles the two-sided flip animation.
 *
 * Standard: Y-axis 3D flip, 360ms, perspective 800px, cubic-bezier ease.
 * Reduced motion: opacity crossfade between faces (200ms).
 *
 * The outer element sets perspective.
 * The inner element rotates and has transform-style: preserve-3d.
 * Each face uses backface-visibility: hidden so only the correct side shows.
 */
export default function PostcardContainer({ postcard }: PostcardContainerProps) {
    const [flipped, setFlipped] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    const DURATION = "480ms";
    const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

    return (
        <div
            className="w-full max-w-postcard mx-auto"
            aria-label="Postcard — tap or click to flip"
        >
            <div
                className={`w-full aspect-[4/3] sm:aspect-[3/2] relative rounded-xl overflow-hidden postcard-tiltable transition-shadow duration-[480ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${flipped ? "shadow-[0_8px_24px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.05)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]"}`}
            >
                {prefersReducedMotion ? (
                    /* ── Reduced motion: crossfade ── */
                    <div
                        className="absolute inset-0 bg-white cursor-pointer select-none"
                        onClick={() => setFlipped((f) => !f)}
                        onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={flipped}
                        aria-label={flipped ? "Viewing back of postcard" : "Viewing front of postcard"}
                    >
                        {/* Front face */}
                        <div
                            className={`transition-opacity duration-[480ms] ease-in-out inset-0 ${flipped ? "opacity-0 absolute pointer-events-none" : "opacity-100 relative pointer-events-auto"}`}
                        >
                            <FrontSide postcard={postcard} />
                        </div>
                        {/* Back face */}
                        <div
                            className={`transition-opacity duration-[480ms] ease-in-out inset-0 ${flipped ? "opacity-100 relative pointer-events-auto" : "opacity-0 absolute pointer-events-none"}`}
                        >
                            <BackSide postcard={postcard} />
                        </div>
                    </div>
                ) : (
                    /* ── Standard: Y-axis 3D flip ── */
                    <div
                        className="absolute inset-0 cursor-pointer select-none [perspective:1000px]"
                        onClick={() => setFlipped((f) => !f)}
                        onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={flipped}
                        aria-label={flipped ? "Viewing back of postcard" : "Viewing front of postcard"}
                    >
                        {/* Flip container — rotates on Y */}
                        <div
                            className={`relative w-full h-full [transform-style:preserve-3d] transition-transform duration-[480ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"}`}
                        >
                            {/* Front face */}
                            <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                                <FrontSide postcard={postcard} />
                            </div>

                            {/* Back face — pre-rotated 180° so it starts face-down */}
                            <div className="absolute top-0 left-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
                                <BackSide postcard={postcard} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Flip hint */}
            <p
                className="text-center mt-3 font-sans text-xs text-accent-muted tracking-[0.04em] select-none"
                aria-hidden="true"
            >
                {flipped ? "tap to see the front" : "tap to turn it over"}
            </p>
        </div>
    );
}

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

    const DURATION = "360ms";
    const EASE = "cubic-bezier(0.33, 1, 0.68, 1)";

    return (
        <div
            className="w-full max-w-postcard mx-auto"
            aria-label="Postcard — tap or click to flip"
        >
            {prefersReducedMotion ? (
                /* ── Reduced motion: crossfade ── */
                <div
                    className="relative w-full bg-white cursor-pointer select-none"
                    onClick={() => setFlipped((f) => !f)}
                    onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={flipped}
                    aria-label={flipped ? "Viewing back of postcard" : "Viewing front of postcard"}
                >
                    {/* Front face */}
                    <div
                        style={{
                            transition: `opacity ${DURATION} ease`,
                            opacity: flipped ? 0 : 1,
                            position: flipped ? "absolute" : "relative",
                            inset: 0,
                            pointerEvents: flipped ? "none" : "auto",
                        }}
                    >
                        <FrontSide postcard={postcard} />
                    </div>
                    {/* Back face */}
                    <div
                        style={{
                            transition: `opacity ${DURATION} ease`,
                            opacity: flipped ? 1 : 0,
                            position: flipped ? "relative" : "absolute",
                            inset: 0,
                            pointerEvents: flipped ? "auto" : "none",
                        }}
                    >
                        <BackSide postcard={postcard} />
                    </div>
                </div>
            ) : (
                /* ── Standard: Y-axis 3D flip ── */
                <div
                    style={{ perspective: "800px" }}
                    className="w-full cursor-pointer select-none"
                    onClick={() => setFlipped((f) => !f)}
                    onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={flipped}
                    aria-label={flipped ? "Viewing back of postcard" : "Viewing front of postcard"}
                >
                    {/* Flip container — rotates on Y */}
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            transformStyle: "preserve-3d",
                            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                            transition: `transform ${DURATION} ${EASE}`,
                        }}
                    >
                        {/* Front face */}
                        <div
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                position: "relative",
                                width: "100%",
                            }}
                        >
                            <FrontSide postcard={postcard} />
                        </div>

                        {/* Back face — pre-rotated 180° so it starts face-down */}
                        <div
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                transform: "rotateY(180deg)",
                            }}
                        >
                            <BackSide postcard={postcard} />
                        </div>
                    </div>
                </div>
            )}

            {/* Flip hint */}
            <p
                className="text-center mt-3"
                style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "0.75rem",
                    color: "#C7C0B8",
                    letterSpacing: "0.04em",
                    userSelect: "none",
                }}
                aria-hidden="true"
            >
                {flipped ? "tap to see front" : "tap to flip"}
            </p>
        </div>
    );
}

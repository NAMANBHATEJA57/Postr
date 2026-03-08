"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import FrontSide from "./FrontSide";
import BackSide from "./BackSide";
import { ApiPostcardResponse } from "@/types/postcard";

interface PostcardContainerProps {
    postcard: ApiPostcardResponse;
}

/** Detect Safari — it doesn't reliably support preserve-3d with overflow:hidden ancestors */
function useIsSafari() {
    const [isSafari, setIsSafari] = useState(false);
    useEffect(() => {
        const ua = navigator.userAgent;
        const isSafariBrowser = /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua);
        setIsSafari(isSafariBrowser);
    }, []);
    return isSafari;
}

/**
 * PostcardContainer — handles the two-sided flip animation.
 *
 * Standard: Y-axis 3D flip, 480ms, perspective 1000px, cubic-bezier ease.
 * Safari / Reduced motion: opacity crossfade between faces (480ms).
 *
 * NOTE: overflow:hidden on a parent kills preserve-3d in Safari, so we
 * apply overflow:hidden only on each individual face, not the wrapper.
 */
export default function PostcardContainer({ postcard }: PostcardContainerProps) {
    const [flipped, setFlipped] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const isSafari = useIsSafari();

    const DURATION = "480ms";
    const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

    // Use crossfade on Safari (preserve-3d is unreliable with overflow:hidden ancestors)
    const useCrossfade = prefersReducedMotion || isSafari;

    return (
        <div
            className="w-full max-w-postcard mx-auto"
            aria-label="Postcard — tap or click to flip"
        >
            {/* Wrapper: no overflow-hidden here — it kills preserve-3d in Safari */}
            <div
                className={`w-full aspect-[4/3] sm:aspect-[3/2] relative rounded-xl postcard-tiltable transition-shadow duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${flipped ? "shadow-[0_4px_12px_rgba(0,0,0,0.08),0_24px_48px_rgba(0,0,0,0.08)]" : "shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)]"}`}
            >
                {useCrossfade ? (
                    /* ── Crossfade (Safari + reduced motion) ── */
                    <div
                        className="absolute inset-0 rounded-xl overflow-hidden bg-white cursor-pointer select-none"
                        onClick={() => setFlipped((f) => !f)}
                        onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
                        tabIndex={0}
                        role="button"
                        aria-pressed={flipped}
                        aria-label={flipped ? "Viewing back of postcard" : "Viewing front of postcard"}
                    >
                        {/* Front face */}
                        <div
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{
                                transition: `opacity ${DURATION} ${EASE}`,
                                opacity: flipped ? 0 : 1,
                                pointerEvents: flipped ? "none" : "auto",
                            }}
                        >
                            <FrontSide postcard={postcard} />
                        </div>
                        {/* Back face */}
                        <div
                            className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{
                                transition: `opacity ${DURATION} ${EASE}`,
                                opacity: flipped ? 1 : 0,
                                pointerEvents: flipped ? "auto" : "none",
                            }}
                        >
                            <BackSide postcard={postcard} />
                        </div>
                    </div>
                ) : (
                    /* ── Standard 3D flip (non-Safari) ── */
                    <div
                        className="absolute inset-0 cursor-pointer select-none"
                        style={{ perspective: "1000px" }}
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
                                height: "100%",
                                transformStyle: "preserve-3d",
                                WebkitTransformStyle: "preserve-3d",
                                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                                transition: `transform ${DURATION} ${EASE}`,
                            }}
                        >
                            {/* Front face */}
                            <div
                                className="absolute inset-0 rounded-xl overflow-hidden"
                                style={{
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                }}
                            >
                                <FrontSide postcard={postcard} />
                            </div>

                            {/* Back face — pre-rotated 180° so it starts face-down */}
                            <div
                                className="absolute inset-0 rounded-xl overflow-hidden"
                                style={{
                                    backfaceVisibility: "hidden",
                                    WebkitBackfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <BackSide postcard={postcard} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Flip hint */}
            <p
                className="text-center mt-3 font-sans text-[11px] text-ink-secondary opacity-60 tracking-[0.04em] select-none transition-opacity duration-200"
                aria-hidden="true"
            >
                {flipped ? "tap to see the front" : "tap to turn it over"}
            </p>
        </div>
    );
}

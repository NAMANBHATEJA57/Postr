"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EnvelopeAnimation from "@/components/envelope/EnvelopeAnimation";
import PostcardRenderer from "@/components/postcard/PostcardRenderer";
import PasswordGate from "@/components/postcard/PasswordGate";
import { apiUrl } from "@/lib/api";
import { ApiPostcardResponse } from "@/types/postcard";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

interface ViewClientProps {
    postcardId: string;
    initialData: ApiPostcardResponse | null;
    status: number;
}

export default function ViewClient({ postcardId, initialData, status }: ViewClientProps) {
    const searchParams = useSearchParams();
    const isCreator = searchParams.get("created") === "true";
    const { user, loading: authLoading } = useAuth();

    const [phase, setPhase] = useState<"loading" | "password" | "envelope" | "reveal">(
        () => {
            if (status === 401) return "password";
            if (initialData) return isCreator ? "reveal" : "envelope";
            return "loading";
        }
    );
    const [postcard, setPostcard] = useState<ApiPostcardResponse | null>(initialData);
    const [shareUrl, setShareUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setShareUrl(typeof window !== "undefined" ? window.location.origin + `/p/${postcardId}` : "");
    }, [postcardId]);

    const fetchPostcard = async (token?: string) => {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(apiUrl(`/api/postcards/${postcardId}`), {
            credentials: "include",
            headers,
        });
        if (res.ok) {
            const data = await res.json();
            setPostcard(data);
            setPhase("envelope");
        }
    };

    const handleUnlocked = (token?: string) => { fetchPostcard(token); };
    const handleEnvelopeOpen = () => { setPhase("reveal"); };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (phase === "loading") {
        return (
            <div className="min-h-dvh flex items-center justify-center">
                <span className="text-body-sm text-accent-muted">loading…</span>
            </div>
        );
    }

    if (phase === "password") {
        return <PasswordGate postcardId={postcardId} onUnlocked={handleUnlocked} />;
    }

    if (phase === "envelope" && postcard) {
        return (
            <EnvelopeAnimation
                toName={postcard.toName}
                fromName={postcard.fromName}
                onOpen={handleEnvelopeOpen}
            />
        );
    }

    if (phase === "reveal" && postcard) {
        return (
            <div className="min-h-dvh flex flex-col items-center px-4 sm:px-0 py-12 md:py-16">
                <div className="w-full max-w-postcard mx-auto flex flex-col items-center">

                    {/* ── HEADER ── */}
                    <div
                        className="text-center flex flex-col items-center gap-1 w-full"
                        style={{ animation: "fadeIn 150ms ease-out forwards" }}
                    >
                        {isCreator ? (
                            <>
                                <h1
                                    style={{
                                        fontFamily: "var(--font-playfair), Georgia, serif",
                                        fontSize: "clamp(1.5rem, 4.5vw, 2.25rem)",
                                        color: "#1A1A1A",
                                        lineHeight: 1.2,
                                        marginBottom: "0.25rem"
                                    }}
                                >
                                    your postcard is ready.
                                </h1>
                                <p
                                    style={{
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        fontSize: "1rem",
                                        color: "#555555",
                                    }}
                                >
                                    share it with {postcard.toName.toLowerCase()}
                                </p>

                                {/* Inline copy link */}
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <span
                                        className="text-ink-secondary truncate"
                                        style={{ fontSize: "0.875rem", fontFamily: "Inter, sans-serif", maxWidth: "200px" }}
                                    >
                                        {shareUrl.replace(/^https?:\/\//, '')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyLink}
                                        className="text-accent hover:text-ink transition-colors px-2 py-1"
                                        style={{ fontSize: "0.8125rem", fontFamily: "Inter, sans-serif" }}
                                    >
                                        {copied ? "copied" : "copy"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p
                                    style={{
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        fontSize: "1rem",
                                        color: "#555555",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {postcard.fromName.toLowerCase()} sent you a postcard.
                                </p>
                                <p
                                    style={{
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        fontSize: "0.875rem",
                                        color: "#C7C0B8",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    to {postcard.toName.toLowerCase()}
                                </p>
                            </>
                        )}
                    </div>

                    {/* ── POSTCARD ── */}
                    <div
                        className="w-full mt-10 mb-12"
                        style={{ animation: "fadeIn 200ms 150ms ease-out both" }}
                    >
                        <PostcardRenderer postcard={postcard} />
                    </div>

                    {/* ── CTA BLOCK ── */}
                    <div
                        className="flex flex-col items-center gap-4 w-full"
                        style={{ animation: "fadeIn 200ms 300ms ease-out both" }}
                    >
                        {isCreator ? (
                            <>
                                <button
                                    onClick={copyLink}
                                    className="inline-flex items-center justify-center bg-accent text-white font-sans text-body-sm tracking-ui w-full sm:w-auto px-8 py-3 sm:py-2 rounded-sm min-h-[44px] hover:bg-[#958879] active:bg-[#877A6E] transition-colors duration-150 select-none"
                                >
                                    {copied ? "copied!" : "copy link"}
                                </button>
                                <Link
                                    href="/create"
                                    className="font-sans text-body-sm text-accent-muted hover:text-ink-secondary transition-colors duration-150"
                                >
                                    create another
                                </Link>

                                {!authLoading && !user && (
                                    <div className="flex flex-col items-center mt-12 pt-12 border-t border-divider w-full max-w-[400px]">
                                        <h2 className="font-serif text-center text-ink text-xl mb-2">
                                            Keep this postcard safe.
                                        </h2>
                                        <p className="font-sans text-center text-ink-secondary text-sm mb-6 leading-relaxed">
                                            Create an account to save your postcards and continue the conversation later.
                                        </p>
                                        <Link
                                            href={`/register?claimPostcardId=${postcard.id}`}
                                            className="inline-flex items-center justify-center bg-transparent border border-neutral-300 text-ink font-sans text-body-sm tracking-ui px-8 py-2 rounded-sm min-h-[44px] hover:bg-black/5 active:bg-black/10 transition-colors duration-150"
                                        >
                                            Create an account
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <a
                                    href="/create"
                                    className="inline-flex items-center justify-center bg-accent text-white font-sans text-body-sm tracking-ui w-full sm:w-auto px-8 py-3 sm:py-2 rounded-sm min-h-[44px] hover:bg-[#958879] active:bg-[#877A6E] transition-colors duration-150 select-none"
                                >
                                    create yours
                                </a>
                                <a
                                    href="/create"
                                    className="font-sans text-body-sm text-accent-muted hover:text-ink-secondary transition-colors duration-150"
                                >
                                    send one back
                                </a>
                            </>
                        )}
                    </div>

                </div>
            </div>
        );
    }

    return null;
}

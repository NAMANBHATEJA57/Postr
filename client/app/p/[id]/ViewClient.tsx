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

function daysUntil(isoDate: string): number {
    const diff = new Date(isoDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface ViewClientProps {
    postcardId: string;
    initialData: ApiPostcardResponse | null;
    status: number;
}

export default function ViewClient({ postcardId, initialData, status }: ViewClientProps) {
    const searchParams = useSearchParams();
    const isCreator = searchParams.get("created") === "true";
    const { user, loading: authLoading } = useAuth();

    const [phase, setPhase] = useState<"loading" | "password" | "envelope" | "reveal">("loading");
    const [postcard, setPostcard] = useState<ApiPostcardResponse | null>(initialData);
    const [shareUrl, setShareUrl] = useState("");
    const [copied, setCopied] = useState(false);

    // Resolve initial phase on the client where searchParams is reliable.
    // Using a lazy initializer caused isCreator to always be false during
    // SSR/hydration because searchParams was empty at that point.
    useEffect(() => {
        if (status === 401) { setPhase("password"); return; }
        if (initialData) { setPhase(isCreator ? "reveal" : "envelope"); return; }
        // status > 0 but no data (e.g. 404/410/500) — parent handles it, but default to loading
    }, [status, initialData, isCreator]);

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
                        className="text-center flex flex-col items-center gap-1 w-full reveal-header"
                    >
                        {isCreator ? (
                            <>
                                <h1 className="reveal-title">
                                    your postcard is ready.
                                </h1>
                                <p className="reveal-subtitle">
                                    share it with {postcard.toName.toLowerCase()}.
                                </p>

                                {/* Inline copy link */}
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <span className="text-ink-secondary truncate reveal-link-text">
                                        {shareUrl.replace(/^https?:\/\//, '')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={copyLink}
                                        className="text-accent hover:text-ink transition-colors px-2 py-1 reveal-link-btn"
                                    >
                                        {copied ? "copied" : "copy"}
                                    </button>
                                </div>

                                {/* Creator expiry notice for guest */}
                                {!authLoading && !user && postcard.expiryAt && (
                                    <p className="reveal-notice">
                                        this postcard disappears in 7 days.{" "}
                                        <Link href={`/register?claimPostcardId=${postcard.id}`} className="reveal-notice-link">
                                            keep it forever — create an account
                                        </Link>.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="reveal-receiver-title">
                                    a postcard from {postcard.fromName.toLowerCase()}.
                                </p>
                                <p className="reveal-receiver-subtitle">
                                    to {postcard.toName.toLowerCase()}
                                </p>
                                {/* Receiver expiry notice — muted, no alarm */}
                                {postcard.expiryAt && (
                                    <p className="reveal-receiver-notice">
                                        this postcard disappears in {daysUntil(postcard.expiryAt)} day{daysUntil(postcard.expiryAt) !== 1 ? "s" : ""}.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── POSTCARD ── */}
                    <div className="w-full mt-10 mb-12 reveal-postcard">
                        <PostcardRenderer postcard={postcard} />
                    </div>

                    {/* ── CTA BLOCK ── */}
                    <div className="flex flex-col items-center gap-4 w-full reveal-cta">
                        {isCreator ? (
                            <>
                                <button
                                    onClick={copyLink}
                                    className="inline-flex items-center justify-center bg-ink text-linen font-sans text-body-sm tracking-ui w-full sm:w-auto px-8 py-3 sm:py-2 rounded-sm min-h-[44px] hover:opacity-80 active:opacity-70 transition-opacity duration-150 select-none"
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
                                            keep it forever.
                                        </h2>
                                        <p className="font-sans text-center text-ink-secondary text-sm mb-6 leading-relaxed">
                                            create an account to save your postcards and continue the conversation.
                                        </p>
                                        <Link
                                            href={`/register?claimPostcardId=${postcard.id}`}
                                            className="inline-flex items-center justify-center bg-ink text-linen font-sans text-body-sm tracking-ui px-8 py-2 rounded-sm min-h-[44px] hover:opacity-80 active:opacity-70 transition-opacity duration-150"
                                        >
                                            create account
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Receiver view: auth-aware CTA */
                            <>
                                {!authLoading && user ? (
                                    /* Logged in: reply to this postcard */
                                    <>
                                        <a
                                            href={postcard.conversationId
                                                ? `/create?conversationId=${postcard.conversationId}`
                                                : "/create"}
                                            className="inline-flex items-center justify-center bg-ink text-linen font-sans text-body-sm tracking-ui w-full sm:w-auto px-8 py-3 sm:py-2 rounded-sm min-h-[44px] hover:opacity-80 active:opacity-70 transition-opacity duration-150 select-none"
                                        >
                                            reply with your own
                                        </a>
                                    </>
                                ) : (
                                    /* Not logged in: generic create + signup nudge */
                                    <>
                                        <a
                                            href="/create"
                                            className="inline-flex items-center justify-center bg-ink text-linen font-sans text-body-sm tracking-ui w-full sm:w-auto px-8 py-3 sm:py-2 rounded-sm min-h-[44px] hover:opacity-80 active:opacity-70 transition-opacity duration-150 select-none"
                                        >
                                            create yours
                                        </a>

                                        {!authLoading && (
                                            <div className="flex flex-col items-center mt-12 pt-12 border-t border-divider w-full max-w-[400px]">
                                                <h2 className="font-serif text-center text-ink text-xl mb-2">
                                                    want to keep this conversation?
                                                </h2>
                                                <p className="font-sans text-center text-ink-secondary text-sm mb-6 leading-relaxed">
                                                    create an account to save your postcards and continue anytime.
                                                </p>
                                                <Link
                                                    href="/register"
                                                    className="inline-flex items-center justify-center bg-ink text-linen font-sans text-body-sm tracking-ui px-8 py-2 rounded-sm min-h-[44px] hover:opacity-80 active:opacity-70 transition-opacity duration-150"
                                                >
                                                    create account
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        );
    }

    return null;
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EnvelopeAnimation from "@/components/envelope/EnvelopeAnimation";
import PostcardRenderer from "@/components/postcard/PostcardRenderer";
import FrontSide from "@/components/postcard/FrontSide";
import BackSide from "@/components/postcard/BackSide";
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
    const [viewMode, setViewMode] = useState<"flip" | "full">("flip");

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

        // Read saved view mode preference
        const savedMode = localStorage.getItem("dearly_viewMode");
        if (savedMode === "flip" || savedMode === "full") {
            setViewMode(savedMode);
        }
    }, [postcardId]);

    const handleViewModeChange = (mode: "flip" | "full") => {
        setViewMode(mode);
        localStorage.setItem("dearly_viewMode", mode);
    };

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

    const copyLink = async () => {
        const textToShare = shareUrl;

        // Remove native share per user request and only use clipboard
        try {
            await navigator.clipboard.writeText(textToShare);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link: ", err);
        }
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
                <div className="w-full max-w-[800px] mx-auto flex flex-col items-center -rotate-[0.4deg]">

                    {/* ── HEADER ── */}
                    <div
                        className="text-center flex flex-col items-center gap-1 w-full reveal-header relative"
                    >
                        {/* ── HEADER CONTENT ── */}

                        {isCreator ? (
                            <>
                                <h1 className="reveal-title mt-4 md:mt-0">
                                    your postcard is ready.
                                </h1>
                                <p className="reveal-subtitle">
                                    send it to {postcard.toName.toLowerCase()}.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="reveal-receiver-title mt-4 md:mt-0">
                                    a postcard from {postcard.fromName.toLowerCase()}.
                                </p>
                                <p className="reveal-receiver-subtitle">
                                    to {postcard.toName.toLowerCase()}
                                </p>
                            </>
                        )}
                    </div>

                    {/* ── POSTCARD & VIEW TOGGLE ── */}
                    <div className="w-full mt-10 mb-8 reveal-postcard flex flex-col items-center">


                        {/* ── POSTCARD RENDERER ── */}
                        <div className="w-full transition-all duration-300 ease-[cubic-bezier(0.25,0,0,1)]">
                            {viewMode === 'flip' ? (
                                <PostcardRenderer postcard={postcard} />
                            ) : (
                                <div className="w-full max-w-postcard mx-auto flex flex-col gap-8 duration-300 animate-in fade-in slide-in-from-top-4">
                                    <div className="w-full aspect-[4/3] sm:aspect-[3/2] relative rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                                        <FrontSide postcard={postcard} />
                                    </div>
                                    <div className="w-full aspect-[4/3] sm:aspect-[3/2] relative rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                                        <BackSide postcard={postcard} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── VIEW MODE TOGGLE (Moved below postcard) ── */}
                    <div className="flex items-center gap-1 bg-surface-raised rounded-full p-1 shadow-sm border border-divider/40 mb-10 mt-2">
                        <button
                            onClick={() => handleViewModeChange('flip')}
                            className={`relative px-4 py-1 text-[11px] font-sans tracking-wide lowercase rounded-full transition-colors duration-200 z-10 ${viewMode === 'flip' ? 'text-ink font-medium' : 'text-ink-secondary hover:text-ink'}`}
                        >
                            {viewMode === 'flip' && (
                                <div className="absolute inset-0 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] -z-10" />
                            )}
                            flip
                        </button>
                        <button
                            onClick={() => handleViewModeChange('full')}
                            className={`relative px-4 py-1 text-[11px] font-sans tracking-wide lowercase rounded-full transition-colors duration-200 z-10 ${viewMode === 'full' ? 'text-ink font-medium' : 'text-ink-secondary hover:text-ink'}`}
                        >
                            {viewMode === 'full' && (
                                <div className="absolute inset-0 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] -z-10" />
                            )}
                            full
                        </button>
                    </div>

                    {/* ── CTA BLOCK ── */}
                    <div className="flex flex-col items-center gap-4 w-full reveal-cta">
                        {isCreator ? (
                            <>
                                {/* Inline copy link - clickable URL row */}
                                <button
                                    type="button"
                                    onClick={copyLink}
                                    className="mb-2 mt-2 flex items-center justify-between w-full max-w-[280px] py-2 px-3 hover:bg-black/[0.03] rounded-md transition-colors duration-200 group cursor-pointer border-none bg-transparent focus:outline-none"
                                    aria-label="Copy postcard link"
                                >
                                    <span className="text-ink-secondary group-hover:text-ink truncate reveal-link-text transition-colors duration-150 text-left">
                                        {shareUrl.replace(/^https?:\/\//, '')}
                                    </span>
                                    <span
                                        className="material-symbols-rounded text-ink-ghost group-hover:text-ink-secondary transition-colors duration-150 select-none flex-shrink-0 pl-3"
                                        style={{ fontSize: 17 }}
                                        aria-hidden="true"
                                    >
                                        {copied ? 'check' : 'content_copy'}
                                    </span>
                                </button>

                                <button
                                    onClick={copyLink}
                                    className={`inline-flex items-center justify-center font-sans text-body-sm tracking-ui w-full sm:w-auto px-8 py-3 sm:py-2 rounded-sm min-h-[44px] transition-all duration-150 select-none ${copied ? 'bg-white text-ink shadow-[0_0_0_1px_rgba(0,0,0,0.1)]' : 'bg-ink text-linen hover:opacity-80 active:opacity-70'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                        {copied ? "link copied" : "copy link"}
                                    </div>
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

                        {/* ── EXPIRY MESSAGES (Moved to bottom) ── */}
                        <div className="mt-8">
                            {isCreator ? (
                                !authLoading && !user && postcard.expiryAt && (
                                    <p className="reveal-notice text-center" style={{ fontSize: '0.75rem' }}>
                                        this postcard will fade in 7 days.{" "}
                                        <Link href={`/register?claimPostcardId=${postcard.id}`} className="reveal-notice-link">
                                            keep it forever — create an account
                                        </Link>
                                    </p>
                                )
                            ) : (
                                postcard.expiryAt && (
                                    <p className="reveal-receiver-notice text-center" style={{ fontSize: '0.75rem' }}>
                                        this postcard will fade in {daysUntil(postcard.expiryAt)} day{daysUntil(postcard.expiryAt) !== 1 ? "s" : ""}.
                                    </p>
                                )
                            )}
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return null;
}

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
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

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

                    {/* ── HEADER NAVIGATION ── */}
                    <div className="w-full max-w-postcard flex justify-between items-center mb-16 relative">
                        <button onClick={() => window.history.back()} className="text-[#888] hover:text-ink flex items-center gap-1.5 transition-colors">
                            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
                            <span className="text-[12px] font-sans">Back</span>
                        </button>
                        <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Image 
                                src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" 
                                alt="Dearly Logo" 
                                width={24} 
                                height={24} 
                                className="object-contain opacity-90" 
                                priority
                            />
                            <span className="font-serif text-[1.4rem] font-bold tracking-tight text-ink">Dearly</span>
                        </Link>
                    </div>

                    {/* ── HEADER CONTENT ── */}
                    <div className="text-center flex flex-col items-center w-full reveal-header relative z-10 mb-6">
                        {isCreator ? (
                            <>
                                <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
                                    it's ready.
                                </h1>
                                <p className="font-sans text-[13px] text-[#555555] mt-2">
                                    send it to <span className="font-semibold italic text-[#555555]">{postcard.toName}</span>.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="font-serif text-[24px] leading-[1.5] text-ink">
                                    a postcard from {postcard.fromName.toLowerCase()}.
                                </h1>
                                <p className="font-sans text-[13px] text-[#888888] mt-2">
                                    to <span className="font-medium italic text-[#555555]">{postcard.toName}</span>.
                                </p>
                            </>
                        )}
                    </div>

                    {/* ── VIEW MODE TOGGLE ── */}
                    <div className="flex flex-col items-center mb-8 w-full relative z-20">
                        <div className="flex items-center gap-1 rounded-[100px] p-1 border border-[#888888]/40 bg-transparent">
                            <button
                                onClick={() => handleViewModeChange('flip')}
                                className={`relative px-6 py-1.5 text-[11px] font-sans tracking-wide rounded-[100px] transition-all duration-200 z-10 ${viewMode === 'flip' ? 'text-ink font-medium bg-white shadow-sm' : 'text-[#888888] hover:text-ink'}`}
                            >
                                Flip Mode
                            </button>
                            <button
                                onClick={() => handleViewModeChange('full')}
                                className={`relative px-6 py-1.5 text-[11px] font-sans tracking-wide rounded-[100px] transition-all duration-200 z-10 ${viewMode === 'full' ? 'text-ink font-medium bg-white shadow-sm' : 'text-[#888888] hover:text-ink'}`}
                            >
                                Full Mode
                            </button>
                        </div>
                        <p className="font-sans text-[11px] text-[#FFBBEB] italic mt-3 font-medium">
                            this postcard will fade in 7 days
                        </p>
                    </div>

                    {/* ── POSTCARD & VIEW TOGGLE ── */}
                    <div className="w-full mb-8 reveal-postcard flex flex-col items-center mt-4">

                        {/* ── POSTCARD RENDERER ── */}
                        <div className="w-full transition-all duration-300 ease-[cubic-bezier(0.25,0,0,1)]">
                            {viewMode === 'flip' ? (
                                <PostcardRenderer postcard={postcard} />
                            ) : (
                                <div className="w-full max-w-postcard mx-auto flex flex-col gap-12 duration-300 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full aspect-[4/3] sm:aspect-[3/2] relative rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                                            <FrontSide postcard={postcard} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-full aspect-[4/3] sm:aspect-[3/2] relative rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                                            <BackSide postcard={postcard} />
                                        </div>
                                    </div>
                                    <p className="text-center font-sans text-[12px] text-ink-secondary opacity-80 mt-[-1rem]">Turn it over see front</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── CTA BLOCK ── */}
                    <div className="flex flex-col items-center w-full reveal-cta mt-4 relative">
                        
                        {/* ── TOAST MESSAGE ── */}
                        <AnimatePresence>
                            {copied && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute -top-12 flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-md shadow-md z-50 pointer-events-none"
                                >
                                    <span className="material-symbols-rounded text-white" style={{ fontSize: 16 }}>check_circle</span>
                                    <span className="font-sans text-[12px] font-medium tracking-wide">Link copied</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isCreator ? (
                            <>
                                {/* Copy Link Box */}
                                <div className="flex items-center justify-between w-full max-w-[420px] bg-white rounded-[6px] py-3.5 pl-4 pr-3 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                                    <span className="text-[13px] font-sans text-ink truncate pr-6 font-medium">
                                        {shareUrl}
                                    </span>
                                    <button
                                        onClick={copyLink}
                                        className="p-1 hover:bg-ink/5 rounded-md transition-colors text-ink-secondary hover:text-ink cursor-pointer focus:outline-none flex-shrink-0"
                                        aria-label="Copy link"
                                    >
                                        <span className="material-symbols-rounded block" style={{ fontSize: 20 }}>
                                            {copied ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>

                                {/* Create Another Button */}
                                <Link
                                    href="/create"
                                    className="w-full max-w-[420px] py-3 border border-[#888] rounded-[6px] flex items-center justify-center font-sans text-[13px] text-ink hover:bg-ink/5 transition-colors mb-7"
                                >
                                    Create another
                                </Link>

                                {/* Account link text removed based on user feedback */}

                                {/* Keep it forever Box */}
                                {!authLoading && !user && (
                                    <div className="bg-white rounded-xl p-10 flex flex-col items-center w-full max-w-[420px] mb-8 mt-4" style={{boxShadow: '0 4px 24px rgba(0,0,0,0.04)'}}>
                                        <h2 className="font-serif text-[1.8rem] font-bold text-ink mb-2">
                                            keep it forever.
                                        </h2>
                                        <p className="font-sans text-[14px] text-ink mb-8 font-medium">
                                            it takes less than a minute
                                        </p>
                                        <Link
                                            href={`/register?claimPostcardId=${postcard.id}`}
                                            className="w-full bg-[#1A1A1A] text-white rounded-[6px] py-3.5 flex items-center justify-center font-sans text-[13px] hover:bg-black transition-colors"
                                        >
                                            Create Account
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
                                            className="inline-flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] font-sans text-[13px] font-medium w-full max-w-[320px] py-3 rounded-[6px] hover:bg-black/5 transition-colors duration-150 select-none mb-8"
                                        >
                                            Create your own postcard
                                        </a>

                                        {!authLoading && !user && (
                                            <div className="bg-white rounded-xl p-10 flex flex-col items-center w-full max-w-[420px] mb-8" style={{boxShadow: '0 4px 24px rgba(0,0,0,0.04)'}}>
                                                <h2 className="font-serif text-[1.8rem] font-bold text-ink mb-2">
                                                    keep it forever.
                                                </h2>
                                                <p className="font-sans text-[14px] text-ink mb-8 font-medium">
                                                    it takes less than a minute
                                                </p>
                                                <Link
                                                    href={`/register?claimPostcardId=${postcard.id}`}
                                                    className="w-full bg-[#1A1A1A] text-white rounded-[6px] py-3.5 flex items-center justify-center font-sans text-[13px] hover:bg-black transition-colors"
                                                >
                                                    Create Account
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

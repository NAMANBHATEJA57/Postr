"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl } from "@/lib/api";
import PostcardContainer from "@/components/postcard/PostcardContainer";

interface PostcardData {
    id: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    title: string;
    message: string;
    toName: string;
    fromName: string;
    theme: string;
    stampId: string | null;
    createdAt: string;
    conversationId: string | null;
    senderId?: string;
    sender?: { id: string; name: string };
}

interface Conversation {
    id: string;
    otherUser: { name: string; email: string };
    postcards: PostcardData[];
}

/** Format a date as "March 1, 2026" for dividers */
function formatDay(isoDate: string) {
    return new Date(isoDate).toLocaleDateString(undefined, {
        month: "long", day: "numeric", year: "numeric",
    });
}

export default function ConversationThreadPage() {
    const params = useParams();
    const conversationId = params.id as string;
    const { user } = useAuth();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!loading && conversation?.postcards.length) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation?.postcards.length, loading]);

    useEffect(() => {
        async function loadThread() {
            try {
                const res = await fetch(apiUrl(`/api/conversations/${conversationId}`), {
                    credentials: "include"
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                const sortedPostcards = data.conversation.postcards.sort(
                    (a: PostcardData, b: PostcardData) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                setConversation({ ...data.conversation, postcards: sortedPostcards });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load thread");
            } finally {
                setLoading(false);
            }
        }
        loadThread();
    }, [conversationId]);

    if (loading) return (
        <main className="min-h-dvh flex items-center justify-center">
            <p className="text-body-sm text-ink-secondary">loading...</p>
        </main>
    );
    if (error) return (
        <main className="min-h-dvh flex items-center justify-center">
            <p className="text-body-sm text-red-500">{error}</p>
        </main>
    );
    if (!conversation) return null;

    return (
        <main
            className="min-h-dvh flex flex-col items-center px-4 py-8 md:py-16"
            style={{ animation: "pageEnter 200ms ease-out both" }}
        >
            <div className="w-full max-w-[600px] flex flex-col">

                {/* ── Header ── */}
                <header className="flex flex-row items-center border-b border-black/10 pb-5 gap-4 sticky top-0 z-10 pt-4"
                    style={{ background: "rgba(248,244,239,0.92)", backdropFilter: "blur(8px)" }}>
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center bg-white border border-neutral-200 rounded-full w-8 h-8 shrink-0 text-ink-secondary hover:text-ink transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </Link>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <h1 className="font-serif text-h4 text-ink truncate">{conversation.otherUser.name}</h1>
                        <p className="text-xs text-ink-secondary font-sans truncate">{conversation.otherUser.email}</p>
                    </div>
                    <Image src="/Logo.png" alt="postr logo" width={26} height={26} className="object-contain shrink-0" />
                </header>

                {/* ── Thread ── */}
                <div className="flex flex-col py-12 pb-8">
                    {conversation.postcards.length === 0 ? (
                        <div className="text-center text-ink-secondary py-16 flex flex-col items-center gap-4">
                            <p className="text-body-sm">No postcards yet.</p>
                            <Image src="/Logo.png" alt="postr icon" width={28} height={28} className="opacity-20 mix-blend-multiply" />
                        </div>
                    ) : (
                        (() => {
                            let lastDay = "";
                            return conversation.postcards.map((pc, index) => {
                                const isMe = pc.senderId === user?.id;
                                const senderName = isMe ? "you" : (pc.sender?.name || pc.fromName).toLowerCase();
                                const day = formatDay(pc.createdAt);
                                const showDivider = day !== lastDay;
                                lastDay = day;

                                return (
                                    <div
                                        key={pc.id}
                                        className="flex flex-col items-center"
                                        style={{ animation: `fadeInUpCard 250ms ${index * 60}ms both` }}
                                    >
                                        {/* Date divider */}
                                        {showDivider && (
                                            <div className="flex items-center gap-3 w-full my-8">
                                                <div className="flex-1 h-px bg-black/8" />
                                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.6875rem", color: "#C7C0B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                                    {day}
                                                </span>
                                                <div className="flex-1 h-px bg-black/8" />
                                            </div>
                                        )}

                                        {/* Serif sender label */}
                                        <p
                                            className="w-full text-center mb-3"
                                            style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "0.9375rem", color: "#6B635A", fontStyle: "italic" }}
                                        >
                                            {senderName}
                                        </p>

                                        {/* Postcard — no wrapper shadow, PostcardContainer owns its own elevation */}
                                        <PostcardContainer
                                            postcard={{
                                                ...pc,
                                                fromName: (pc.sender?.name || pc.fromName) ?? "Unknown",
                                                toName: conversation.otherUser.name,
                                                isPasswordProtected: false,
                                                expiryAt: null,
                                            }}
                                        />

                                        {/* bottom spacer between cards */}
                                        <div className="h-10" />
                                    </div>
                                );
                            });
                        })()
                    )}
                </div>

                <div ref={bottomRef} className="h-2" />

                {/* ── Reply CTA ── */}
                <div
                    className="flex flex-col items-center"
                    style={{ paddingTop: "56px", paddingBottom: "48px" }}
                >
                    {conversation.postcards.length === 1 && (
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.8125rem",
                                color: "#C7C0B8",
                                letterSpacing: "0.04em",
                                marginBottom: "16px",
                            }}
                        >
                            start something back.
                        </p>
                    )}
                    <a
                        href={`/create?conversationId=${conversation.id}`}
                        className="group"
                        style={{ textDecoration: "none" }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--font-playfair), Georgia, serif",
                                fontSize: "1.125rem",
                                fontWeight: 500,
                                color: "#1A1A1A",
                                opacity: 0.9,
                                transition: "opacity 150ms ease",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = "1";
                                const arrow = (e.currentTarget as HTMLElement).querySelector(".cta-arrow") as HTMLElement;
                                if (arrow) arrow.style.transform = "translateX(2px)";
                                (e.currentTarget as HTMLElement).style.textDecoration = "underline";
                                (e.currentTarget as HTMLElement).style.textUnderlineOffset = "3px";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = "0.9";
                                const arrow = (e.currentTarget as HTMLElement).querySelector(".cta-arrow") as HTMLElement;
                                if (arrow) arrow.style.transform = "translateX(0)";
                                (e.currentTarget as HTMLElement).style.textDecoration = "none";
                            }}
                        >
                            Write a new postcard
                            <span
                                className="cta-arrow"
                                style={{ display: "inline-block", transition: "transform 150ms ease" }}
                            >
                                →
                            </span>
                        </span>
                    </a>
                </div>

            </div>
        </main>
    );
}

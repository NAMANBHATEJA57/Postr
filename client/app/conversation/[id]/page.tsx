"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

function formatDay(isoDate: string) {
    return new Date(isoDate).toLocaleDateString(undefined, {
        month: "long", day: "numeric", year: "numeric",
    });
}

function Icon({ name, size = 18, style }: { name: string; size?: number; style?: React.CSSProperties }) {
    return (
        <span
            className="material-symbols-rounded select-none"
            style={{ fontSize: size, lineHeight: 1, ...style }}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}

export default function ConversationThreadPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.id as string;
    const { user } = useAuth();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteToast, setDeleteToast] = useState("");

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
                setError(err instanceof Error ? err.message : "Failed to load");
            } finally {
                setLoading(false);
            }
        }
        loadThread();
    }, [conversationId]);

    const handleDelete = async () => {
        setShowDeleteModal(false);
        setIsDeleting(true);

        try {
            const res = await fetch(apiUrl(`/api/conversations/${conversationId}`), {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Delete failed");

            // Wait for fade-out, then redirect
            setTimeout(() => {
                router.push("/dashboard");
            }, 200);

        } catch (err) {
            console.error(err);
            setIsDeleting(false);
            setDeleteToast("couldn’t delete. try again.");
            setTimeout(() => setDeleteToast(""), 3000);
        }
    };

    if (loading) return (
        <main style={{ minHeight: "100dvh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", color: "#C7C0B8", opacity: 0.7 }}>opening…</p>
        </main>
    );
    if (error) return (
        <main style={{ minHeight: "100dvh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", color: "#ef4444" }}>{error}</p>
        </main>
    );
    if (!conversation) return null;

    return (
        <main
            style={{
                minHeight: "100dvh",
                background: "#F8F4EF",
                transition: "opacity 200ms ease-out, transform 200ms ease-out",
                opacity: isDeleting ? 0 : 1,
                transform: isDeleting ? "translateY(-6px)" : "translateY(0)",
                animation: isDeleting ? "none" : "pageEnter 200ms ease-out both",
            }}
        >
            {/* ── Page container — matches dashboard ── */}
            <div
                style={{
                    maxWidth: "720px",
                    margin: "0 auto",
                    paddingTop: "64px",
                    paddingBottom: "80px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                }}
            >
                {/* ── Card wrapper — matches dashboard ── */}
                <div
                    style={{
                        background: "rgba(255,255,255,0.60)",
                        borderRadius: "16px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
                        padding: "32px",
                    }}
                >

                    {/* ── Header row ── */}
                    <header
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            marginBottom: "20px",
                        }}
                    >
                        {/* Left: back link */}
                        <Link
                            href="/dashboard"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.875rem",
                                color: "#6B635A",
                                textDecoration: "none",
                                transition: "color 150ms ease",
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "#1A1A1A"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "#6B635A"; }}
                        >
                            <Icon name="chevron_left" size={16} />
                            conversations
                        </Link>

                        {/* Center: conversation name */}
                        <h1
                            style={{
                                fontFamily: "var(--font-playfair), Georgia, serif",
                                fontSize: "1.0625rem",
                                fontWeight: 400,
                                fontStyle: "italic",
                                color: "#1A1A1A",
                                margin: 0,
                                flex: 1,
                                textAlign: "center",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                paddingLeft: "12px",
                                paddingRight: "12px",
                            }}
                        >
                            {conversation.otherUser.name.toLowerCase()}
                        </h1>

                        {/* Right: delete action */}
                        <div style={{ flexShrink: 0, display: "flex", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="cta-link"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.8125rem",
                                    color: "#A9A19A",
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    cursor: "pointer",
                                    transition: "opacity 150ms ease, color 150ms ease",
                                    opacity: 0.6,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#1A1A1A"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.color = "#A9A19A"; }}
                            >
                                <Icon name="delete" size={16} style={{ fontWeight: 300 }} />
                                <span style={{ marginLeft: "6px", display: "inline-block" }}>delete</span>
                            </button>
                        </div>
                    </header>

                    {/* ── Header divider — matches dashboard ── */}
                    <div style={{ borderTop: "1px solid #E8E4DF", marginBottom: "32px" }} />

                    {/* ── Thread ── */}
                    {conversation.postcards.length === 0 ? (
                        <div style={{ textAlign: "center", paddingTop: "48px", paddingBottom: "48px" }}>
                            <p
                                style={{
                                    fontFamily: "var(--font-playfair), Georgia, serif",
                                    fontSize: "1rem",
                                    fontStyle: "italic",
                                    color: "#6B635A",
                                    opacity: 0.6,
                                }}
                            >
                                nothing here yet.
                            </p>
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
                                        style={{
                                            animation: `fadeInUpCard 250ms ${index * 60}ms both`,
                                            marginBottom: "40px",
                                        }}
                                    >
                                        {/* Date divider */}
                                        {showDivider && (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    marginBottom: "28px",
                                                }}
                                            >
                                                <div style={{ flex: 1, height: "1px", background: "#E8E4DF" }} />
                                                <span
                                                    style={{
                                                        fontFamily: "Inter, sans-serif",
                                                        fontSize: "0.6875rem",
                                                        color: "#A9A19A",
                                                        letterSpacing: "0.06em",
                                                        textTransform: "uppercase",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {day}
                                                </span>
                                                <div style={{ flex: 1, height: "1px", background: "#E8E4DF" }} />
                                            </div>
                                        )}

                                        {/* Sender label */}
                                        <p
                                            style={{
                                                fontFamily: "var(--font-playfair), Georgia, serif",
                                                fontSize: "0.9375rem",
                                                color: "#6B635A",
                                                fontStyle: "italic",
                                                textAlign: isMe ? "right" : "left",
                                                marginBottom: "12px",
                                            }}
                                        >
                                            {senderName}
                                        </p>

                                        {/* Postcard */}
                                        <div
                                            style={{
                                                marginLeft: isMe ? "24px" : "0",
                                                marginRight: isMe ? "0" : "24px",
                                            }}
                                        >
                                            <PostcardContainer
                                                postcard={{
                                                    ...pc,
                                                    fromName: (pc.sender?.name || pc.fromName) ?? "Unknown",
                                                    toName: conversation.otherUser.name,
                                                    isPasswordProtected: false,
                                                    expiryAt: null,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            });
                        })()
                    )}

                    <div ref={bottomRef} />

                    {/* ── Reply CTA ── */}
                    <div
                        style={{
                            borderTop: "1px solid #E8E4DF",
                            paddingTop: "28px",
                            marginTop: "32px",
                        }}
                    >
                        <a
                            href={`/create?conversationId=${conversation.id}`}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "48px",
                                background: "#1A1A1A",
                                color: "#F8F4EF",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.875rem",
                                letterSpacing: "0.02em",
                                textDecoration: "none",
                                borderRadius: "8px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                transition: "background 150ms ease, transform 100ms ease",
                                userSelect: "none",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#111111"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#1A1A1A"; }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            send another postcard
                        </a>
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.75rem",
                                color: "#C7C0B8",
                                textAlign: "center",
                                marginTop: "12px",
                                letterSpacing: "0.02em",
                            }}
                        >
                            this conversation is saved in your account.
                        </p>
                    </div>

                </div>
            </div>

            {/* ── Soft Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        background: "rgba(248,244,239,0.50)",
                        backdropFilter: "blur(2px)",
                        animation: "fadeIn 180ms ease both",
                    }}
                >
                    <div
                        style={{
                            background: "#FFFFFF",
                            borderRadius: "16px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
                            padding: "36px",
                            width: "100%",
                            maxWidth: "400px",
                            textAlign: "center",
                            animation: "fadeInUpCard 220ms ease both",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "var(--font-playfair), Georgia, serif",
                                fontSize: "1.125rem",
                                fontWeight: 400,
                                color: "#1A1A1A",
                                margin: "0 0 8px 0",
                            }}
                        >
                            delete this conversation?
                        </p>
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.875rem",
                                color: "#A9A19A",
                                margin: "0 0 32px 0",
                                lineHeight: 1.5,
                            }}
                        >
                            This will remove all letters inside.
                        </p>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.875rem",
                                    color: "#A9A19A",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "8px",
                                    transition: "color 150ms ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#1A1A1A"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#A9A19A"; }}
                            >
                                cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.875rem",
                                    color: "#C08497",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "8px",
                                    transition: "opacity 150ms ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                                delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Soft Error Toast ── */}
            {deleteToast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "32px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 60,
                        background: "#1A1A1A",
                        color: "#F8F4EF",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.8125rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        animation: "fadeInUp 200ms ease both",
                    }}
                >
                    {deleteToast}
                </div>
            )}
        </main>
    );
}

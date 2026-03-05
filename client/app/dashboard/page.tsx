"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl } from "@/lib/api";
import Input from "@/components/ui/Input";

interface Conversation {
    id: string;
    otherUser: { name: string; email: string };
    latestPostcard: { id: string; message: string; createdAt: string; senderId?: string } | null;
    postcardCount?: number;
    createdAt: string;
}

const ACCENT_COLORS = ["#C08497", "#5E8B7E", "#8E7DBE", "#C46A4A"];
function accentForIndex(i: number) {
    return ACCENT_COLORS[i % ACCENT_COLORS.length];
}

function Icon({ name, size = 18, style, className }: { name: string; size?: number; style?: React.CSSProperties; className?: string }) {
    return (
        <span
            className={`material-symbols-rounded select-none ${className || ""}`}
            style={{ fontSize: size, lineHeight: 1, ...style }}
            aria-hidden="true"
        >
            {name}
        </span>
    );
}

export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewDialogue, setShowNewDialogue] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newError, setNewError] = useState("");
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!user) return; // Wait until authenticated
        async function loadConversations() {
            try {
                const res = await fetch(apiUrl("/api/conversations"), { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data.conversations);
                }
            } catch (err) {
                console.error("Failed to load conversations", err);
            } finally {
                setLoading(false);
            }
        }
        loadConversations();
    }, [user]);

    const handleStartConversation = async (e: React.FormEvent) => {
        e.preventDefault();
        setNewError("");
        try {
            const res = await fetch(apiUrl("/api/conversations"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: newEmail }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setShowNewDialogue(false);
            navigateTo(`/conversation/${data.conversation.id}`);
        } catch (err) {
            setNewError(err instanceof Error ? err.message : "Failed to start");
        }
    };

    const navigateTo = (href: string) => {
        setLeaving(true);
        setTimeout(() => router.push(href), 180);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            window.location.href = "/";
        }
    };

    return (
        <main
            style={{
                minHeight: "100dvh",
                background: "#F8F4EF",
                transition: "opacity 180ms ease, transform 180ms ease",
                opacity: leaving ? 0 : 1,
                transform: leaving ? "translateY(-6px)" : "translateY(0)",
            }}
        >
            {/* ── Page container ── */}
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
                {/* ── Card wrapper ── */}
                <div
                    style={{
                        background: "rgba(255,255,255,0.60)",
                        borderRadius: "16px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
                        padding: "32px",
                        transition: "opacity 200ms ease",
                        opacity: showNewDialogue ? 0.5 : 1,
                    }}
                >

                    {/* ── Header row ── */}
                    <header
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            marginBottom: "20px",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "var(--font-playfair), Georgia, serif",
                                fontSize: "1.125rem",
                                fontWeight: 400,
                                color: "#1A1A1A",
                                letterSpacing: "-0.01em",
                                margin: 0,
                            }}
                        >
                            your conversations
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.8125rem",
                                    color: "#C7C0B8",
                                }}
                            >
                                {user?.email}
                            </span>
                            <span style={{ color: "#E1DCD7", fontSize: "0.75rem", userSelect: "none" }}>·</span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.8125rem",
                                    color: "#C7C0B8",
                                    background: "none",
                                    border: "none",
                                    outline: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    transition: "opacity 150ms ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.5"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                            >
                                log out
                            </button>
                        </div>
                    </header>

                    {/* ── Divider ── */}
                    <div style={{ borderTop: "1px solid #E8E4DF", marginBottom: "24px" }} />

                    {/* ── Write CTA ── */}
                    <div style={{ marginBottom: "28px" }}>
                        <button
                            onClick={() => setShowNewDialogue(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                height: "48px",
                                background: "#1A1A1A",
                                color: "#F8F4EF",
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.875rem",
                                letterSpacing: "0.02em",
                                border: "none",
                                borderRadius: "8px",
                                paddingLeft: "20px",
                                paddingRight: "16px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                cursor: "pointer",
                                transition: "background 150ms ease, transform 100ms ease",
                                userSelect: "none",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#111111"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#1A1A1A"; }}
                            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.99)"; }}
                            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        >
                            Start a conversation
                            <Icon name="arrow_forward" size={18} style={{ color: "#F8F4EF", opacity: 0.7 }} />
                        </button>
                    </div>

                    {/* ── Conversation list / empty state ── */}
                    {loading ? (
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.875rem",
                                color: "#C7C0B8",
                                textAlign: "center",
                                paddingTop: "48px",
                                opacity: 0.7,
                            }}
                        >
                            opening your drawer…
                        </p>
                    ) : conversations.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "12px",
                                paddingTop: "48px",
                            }}
                        >
                            <p
                                style={{
                                    fontFamily: "var(--font-playfair), Georgia, serif",
                                    fontSize: "1.125rem",
                                    color: "#555555",
                                    opacity: 0.85,
                                    margin: 0,
                                    fontStyle: "italic",
                                }}
                            >
                                no conversations yet.
                            </p>
                            <button
                                onClick={() => setShowNewDialogue(true)}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.875rem",
                                    color: "#C7C0B8",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    transition: "color 150ms ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#555555"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#C7C0B8"; }}
                            >
                                <Icon name="arrow_forward" size={16} />
                                start one
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {conversations.map((c, index) => {
                                const hasUnread = !!(c.latestPostcard && c.latestPostcard.senderId !== user?.id);
                                const count = c.postcardCount ?? (c.latestPostcard ? 1 : 0);
                                const accent = accentForIndex(index);

                                return (
                                    <div
                                        key={c.id}
                                        className="group relative"
                                        style={{
                                            transition: "opacity 200ms ease-out, transform 200ms ease-out, height 200ms ease-out, margin 200ms ease-out",
                                        }}
                                    >
                                        <button
                                            onClick={() => navigateTo(`/conversation/${c.id}`)}
                                            style={{
                                                display: "block",
                                                width: "100%",
                                                textAlign: "left",
                                                background: "#FFFFFF",
                                                border: "none",
                                                outline: "none",
                                                cursor: "pointer",
                                                borderRadius: "12px",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                                paddingTop: "20px",
                                                paddingBottom: "20px",
                                                paddingLeft: "28px",
                                                paddingRight: "28px",
                                                transition: "box-shadow 150ms ease, transform 150ms ease",
                                                animation: `fadeInUpCard 250ms ${index * 50}ms both`,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.10)";
                                                e.currentTarget.style.transform = "translateY(-2px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: "50%",
                                                            background: hasUnread ? accent : "transparent",
                                                            flexShrink: 0,
                                                            boxShadow: hasUnread ? `0 0 0 2px ${accent}22` : "none",
                                                        }}
                                                    />
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0 }}>
                                                        <p
                                                            style={{
                                                                fontFamily: "var(--font-playfair), Georgia, serif",
                                                                fontSize: "1.0625rem",
                                                                fontWeight: hasUnread ? 600 : 400,
                                                                color: "#1A1A1A",
                                                                margin: 0,
                                                                lineHeight: 1.3,
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                            }}
                                                        >
                                                            {c.otherUser.name.toLowerCase()}
                                                        </p>
                                                        <p
                                                            style={{
                                                                fontFamily: "Inter, sans-serif",
                                                                fontSize: "0.8125rem",
                                                                color: "#C7C0B8",
                                                                margin: 0,
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {count > 0 ? `${count} ${count === 1 ? "postcard" : "postcards"}` : "no postcards yet"}
                                                        </p>
                                                        {c.latestPostcard?.message && (
                                                            <p
                                                                style={{
                                                                    fontFamily: "Inter, sans-serif",
                                                                    fontSize: "0.75rem",
                                                                    color: "#C7C0B8",
                                                                    margin: 0,
                                                                    lineHeight: 1.4,
                                                                    whiteSpace: "nowrap",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    maxWidth: "200px",
                                                                    opacity: 0.7,
                                                                }}
                                                            >
                                                                {c.latestPostcard.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    className="hidden md:flex transition-opacity duration-150 ease-out group-hover:opacity-0"
                                                    style={{ alignItems: "center", gap: "8px", flexShrink: 0 }}
                                                >
                                                    {c.latestPostcard ? (
                                                        <span
                                                            className="md:block hidden"
                                                            style={{
                                                                fontFamily: "Inter, sans-serif",
                                                                fontSize: "0.75rem",
                                                                color: "#C7C0B8",
                                                                letterSpacing: "0.02em",
                                                            }}
                                                        >
                                                            {new Date(c.latestPostcard.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                        </span>
                                                    ) : <span style={{ width: "36px" }} />}
                                                    <Icon name="chevron_right" size={16} style={{ color: "#C7C0B8" }} />
                                                </div>

                                                {/* Mobile only right side (timestamp + chevron doesn't fade, just adds 3-dot) */}
                                                <div className="md:hidden flex items-center gap-2 shrink-0">
                                                    {c.latestPostcard && (
                                                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#C7C0B8", letterSpacing: "0.02em" }}>
                                                            {new Date(c.latestPostcard.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                        </span>
                                                    )}
                                                    <Icon name="chevron_right" size={16} style={{ color: "#C7C0B8" }} />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── New conversation card overlay ── */}
            {showNewDialogue && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowNewDialogue(false); }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        background: "rgba(248,244,239,0.70)",
                        backdropFilter: "blur(4px)",
                        animation: "fadeIn 180ms ease both",
                    }}
                >
                    <div
                        style={{
                            background: "#FFFFFF",
                            borderRadius: "16px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
                            padding: "40px",
                            width: "100%",
                            maxWidth: "480px",
                            animation: "fadeInUpCard 220ms ease both",
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "var(--font-playfair), Georgia, serif",
                                fontSize: "1.25rem",
                                fontWeight: 400,
                                color: "#1A1A1A",
                                margin: "0 0 6px 0",
                            }}
                        >
                            Start a new conversation
                        </p>
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "0.875rem",
                                color: "#A9A19A",
                                margin: "0 0 28px 0",
                            }}
                        >
                            Who are you writing to?
                        </p>

                        <form onSubmit={handleStartConversation} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="their email address"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                            {newError && (
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8125rem", color: "#ef4444", margin: 0 }}>
                                    {newError}
                                </p>
                            )}

                            {/* Primary button */}
                            <button
                                type="submit"
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
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                    cursor: "pointer",
                                    transition: "background 150ms ease, transform 100ms ease",
                                    userSelect: "none",
                                    marginTop: "4px",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#111111"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#1A1A1A"; }}
                                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                                onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                Continue
                            </button>

                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={() => { setShowNewDialogue(false); setNewEmail(""); setNewError(""); }}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "center",
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.8125rem",
                                    color: "#A9A19A",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "4px 0",
                                    transition: "color 150ms ease",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = "#1A1A1A"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = "#A9A19A"; }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

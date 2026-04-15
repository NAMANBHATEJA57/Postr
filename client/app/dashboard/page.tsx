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
    const [newToName, setNewToName] = useState("");
    const [newFromName, setNewFromName] = useState("");
    const [newDescription, setNewDescription] = useState("");
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
                const res = await fetch(apiUrl("/api/conversations"), {
                    credentials: "include",
                    cache: "no-store",
                });
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
                body: JSON.stringify({ email: newEmail, toName: newToName, fromName: newFromName, description: newDescription }),
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
            className={`min-h-dvh transition-all duration-150 ease-out bg-surface ${leaving ? "opacity-0 -translate-y-[6px]" : "opacity-100 translate-y-0"}`}
        >
            {/* ── Page container ── */}
            <div className="max-w-[720px] mx-auto pt-16 pb-20 px-6">
                
                {/* ── User Meta ── */}
                <div className="flex justify-end items-center gap-2.5 mb-8">
                    <span className="font-sans text-[13px] text-ink-muted">
                        {user?.email}
                    </span>
                    <span className="text-divider text-xs select-none">·</span>
                    <button
                        onClick={handleLogout}
                        className="font-sans text-[13px] text-ink-muted bg-transparent border-none outline-none cursor-pointer p-0 transition-colors duration-150 hover:text-ink-secondary"
                    >
                        log out
                    </button>
                </div>

                {/* ── Emotional Header ── */}
                <header className="flex flex-col items-center text-center w-full mb-12">
                    <h1 className="font-serif text-[2.25rem] md:text-[2.75rem] font-normal text-ink leading-tight mb-2">
                        your collections
                    </h1>
                    <p className="font-sans text-[1.0625rem] text-ink-secondary mb-8">
                        for all the times I can’t be there
                    </p>
                    
                    {/* ── Write CTA ── */}
                    <button
                        onClick={() => setShowNewDialogue(true)}
                        className="flex items-center justify-center gap-2 h-14 bg-ink text-linen font-sans text-[0.9375rem] tracking-[0.02em] border-none rounded-xl px-8 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-ink-secondary hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
                    >
                        + add letter
                    </button>
                </header>

                    {/* ── Conversation list / empty state ── */}
                    {loading ? (
                        <p className="font-sans text-sm text-accent-muted text-center pt-12 opacity-70">
                            opening your drawer…
                        </p>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-start gap-4 pt-12 px-2">
                            <p className="font-serif text-[1.125rem] text-ink-secondary opacity-[0.85] m-0 italic">
                                your letter box is empty.
                            </p>
                            <button
                                onClick={() => setShowNewDialogue(true)}
                                className="inline-flex items-center gap-2 font-sans text-sm text-accent-muted bg-transparent border-none cursor-pointer p-0 transition-colors duration-150 hover:text-ink-secondary"
                            >
                                start something <Icon name="arrow_forward" size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {conversations.map((c, index) => {
                                const hasUnread = !!(c.latestPostcard && c.latestPostcard.senderId !== user?.id);
                                const count = c.postcardCount ?? (c.latestPostcard ? 1 : 0);
                                const accent = accentForIndex(index);

                                return (
                                    <div
                                        key={c.id}
                                        className="group relative transition-all duration-200 ease-out"
                                    >
                                        <button
                                            onClick={() => navigateTo(`/conversation/${c.id}`)}
                                            className="block w-full text-left bg-surface-card border border-divider outline-none cursor-pointer rounded-xl px-7 py-6 elevation-1 transition-all duration-300 hover:elevation-2 hover:-rotate-1 hover:scale-[1.01]"
                                            style={{
                                                animation: `fadeInUpCard 250ms ${index * 50}ms both`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{
                                                            background: hasUnread ? accent : "transparent",
                                                            boxShadow: hasUnread ? `0 0 0 2px ${accent}22` : "none",
                                                        }}
                                                    />
                                                    <div className="flex flex-col gap-[3px] min-w-0">
                                                        <p className={`font-serif text-[1.0625rem] text-ink m-0 leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis ${hasUnread ? "font-semibold" : "font-normal"}`}>
                                                            {c.otherUser.name.toLowerCase()}
                                                        </p>
                                                        <p className="font-sans text-[13px] text-accent-muted m-0 leading-[1.4]">
                                                            {count > 0 ? `${count} ${count === 1 ? "postcard" : "postcards"}` : "no postcards yet"}
                                                        </p>
                                                        {c.latestPostcard?.message && (
                                                            <p className="font-sans text-xs text-accent-muted m-0 leading-[1.4] whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] opacity-70">
                                                                {c.latestPostcard.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex items-center gap-2 shrink-0 transition-opacity duration-150 ease-out group-hover:opacity-0">
                                                    {c.latestPostcard ? (
                                                        <span className="hidden md:block font-sans text-xs text-accent-muted tracking-[0.02em]">
                                                            {new Date(c.latestPostcard.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                        </span>
                                                    ) : <span className="w-9" />}
                                                    <Icon name="chevron_right" size={16} className="text-accent-muted" />
                                                </div>

                                                {/* Mobile only right side (timestamp + chevron doesn't fade, just adds 3-dot) */}
                                                <div className="md:hidden flex items-center gap-2 shrink-0">
                                                    {c.latestPostcard && (
                                                        <span className="font-sans text-xs text-accent-muted tracking-[0.02em]">
                                                            {new Date(c.latestPostcard.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                        </span>
                                                    )}
                                                    <Icon name="chevron_right" size={16} className="text-accent-muted" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </div>

            {/* ── New collection card overlay ── */}
            {showNewDialogue && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowNewDialogue(false); }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-surface/80 backdrop-blur-sm animate-[fadeIn_200ms_ease_both]"
                >
                    <div className="bg-surface-card rounded-2xl elevation-2 p-10 w-full max-w-[480px] animate-[fadeInUpCard_300ms_ease_both] flex flex-col items-center text-center">
                        <p className="font-serif text-[1.75rem] font-normal text-ink mb-1">
                            create collection
                        </p>
                        <p className="font-sans text-sm text-ink-secondary mb-8">
                            start gathering letters for someone.
                        </p>

                        <form onSubmit={handleStartConversation} className="flex flex-col gap-5 w-full">
                            <Input
                                id="to-name"
                                type="text"
                                placeholder="to — someone special"
                                value={newToName}
                                onChange={(e) => setNewToName(e.target.value)}
                            />
                            <Input
                                id="from-name"
                                type="text"
                                placeholder="from — your name"
                                value={newFromName}
                                onChange={(e) => setNewFromName(e.target.value)}
                            />
                            <Input
                                id="description"
                                type="text"
                                placeholder="description — for all the times I can't be there"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="recipient's email address"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                            {newError && (
                                <p className="font-sans text-[13px] text-accent-red m-0">
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

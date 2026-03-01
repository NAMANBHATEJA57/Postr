"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Conversation {
    id: string;
    otherUser: { name: string; email: string };
    latestPostcard: { id: string; message: string; createdAt: string; senderId?: string } | null;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewDialogue, setShowNewDialogue] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newError, setNewError] = useState("");
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
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
    }, []);

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

            navigateTo(`/conversation/${data.conversation.id}`);
        } catch (err) {
            setNewError(err instanceof Error ? err.message : "Failed to start conversation");
        }
    };

    const navigateTo = (href: string, cardEl?: HTMLButtonElement) => {
        // Scale card up slightly, then fade+navigate
        if (cardEl) {
            cardEl.style.transform = "scale(1.02)";
            cardEl.style.opacity = "0.7";
        }
        setTimeout(() => {
            setLeaving(true);
            setTimeout(() => router.push(href), 150);
        }, 180);
    };

    return (
        <main
            className="min-h-dvh flex flex-col items-center px-4 py-12 md:py-16"
            style={{
                transition: "opacity 150ms ease, transform 150ms ease",
                opacity: leaving ? 0 : 1,
                transform: leaving ? "translateY(-8px)" : "translateY(0)",
            }}
        >
            <div className="w-full max-w-[640px] flex flex-col gap-10">

                <header className="flex flex-col gap-6 border-b border-black/10 pb-6">
                    <div className="flex flex-row justify-between items-center w-full">
                        <div className="flex items-center gap-4">
                            <h1 className="font-serif text-h3 text-ink">Your postcards</h1>
                            <Image src="/Logo.png" alt="postr logo" width={24} height={24} className="object-contain" />
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-body-sm text-ink-secondary">{user?.email}</p>
                            <span className="text-ink-secondary/30">•</span>
                            <button onClick={logout} className="text-body-sm text-accent-muted hover:text-ink transition-colors underline-offset-2 hover:underline">
                                logout
                            </button>
                        </div>
                    </div>
                </header>

                {showNewDialogue ? (
                    <div className="bg-white p-6 rounded-md shadow-sm border border-neutral-100 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-sans font-medium">New Conversation</h2>
                            <button
                                onClick={() => setShowNewDialogue(false)}
                                className="text-body-sm text-ink-secondary hover:text-ink"
                            >
                                cancel
                            </button>
                        </div>
                        <form onSubmit={handleStartConversation} className="flex flex-col gap-4">
                            <Input
                                id="email"
                                type="email"
                                placeholder="exact user email address"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                            />
                            {newError && <p className="text-body-sm text-red-500">{newError}</p>}
                            <Button type="submit" className="w-full sm:w-auto">Start</Button>
                        </form>
                    </div>
                ) : (
                    <div className="flex justify-center -mt-2 mb-4">
                        <Button
                            onClick={() => setShowNewDialogue(true)}
                            className="w-full md:max-w-[320px]"
                        >
                            Start a new postcard
                        </Button>
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-body-sm text-ink-secondary pt-8">loading...</p>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 pt-16">
                        <p className="text-center text-body-lg text-ink-secondary opacity-80">
                            You haven't started any conversations yet.
                        </p>
                        <p className="text-center text-body-sm text-accent-muted">
                            Send your first postcard.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6 mt-2">
                        {conversations.map((c, index) => {
                            const hasUnread = c.latestPostcard && c.latestPostcard.senderId !== user?.id;
                            const preview = c.latestPostcard?.message ?? null;
                            const dateStr = c.latestPostcard
                                ? new Date(c.latestPostcard.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                : new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });

                            return (
                                <button
                                    key={c.id}
                                    onClick={(e) => navigateTo(`/conversation/${c.id}`, e.currentTarget)}
                                    className="group w-full text-left bg-white border border-neutral-100 rounded-sm relative select-none"
                                    style={{
                                        padding: "20px 24px",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                        animation: `fadeInUpCard 250ms ${index * 60}ms both`,
                                        transition: "transform 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms cubic-bezier(0.4,0,0.2,1), opacity 180ms ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                                    }}
                                    onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                                    onMouseUp={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                    onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
                                    onTouchEnd={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    {/* Name row with right-aligned date */}
                                    <div className="flex items-start justify-between gap-4 w-full">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {hasUnread && (
                                                <div
                                                    className="rounded-full bg-accent flex-shrink-0"
                                                    style={{ width: 6, height: 6, marginTop: 2 }}
                                                />
                                            )}
                                            <h3
                                                className="text-ink min-w-0"
                                                style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "1.0625rem", lineHeight: 1.3 }}
                                            >
                                                {c.otherUser.name}
                                            </h3>
                                        </div>
                                        <span
                                            className="flex-shrink-0"
                                            style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#C7C0B8", letterSpacing: "0.03em", paddingTop: 2 }}
                                        >
                                            {dateStr}
                                        </span>
                                    </div>

                                    {/* Message preview */}
                                    <div style={{ marginTop: 6 }}>
                                        {preview ? (
                                            <p
                                                className="truncate"
                                                style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", color: "#6B635A", lineHeight: 1.55 }}
                                            >
                                                {c.latestPostcard?.senderId === user?.id ? "You: " : ""}
                                                &ldquo;{preview}&rdquo;
                                            </p>
                                        ) : (
                                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.875rem", color: "#C7C0B8", fontStyle: "italic" }}>
                                                No messages yet.
                                            </p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

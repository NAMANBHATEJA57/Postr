"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewDialogue, setShowNewDialogue] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newError, setNewError] = useState("");

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

            window.location.href = `/conversation/${data.conversation.id}`;
        } catch (err) {
            setNewError(err instanceof Error ? err.message : "Failed to start conversation");
        }
    };

    return (
        <main className="min-h-dvh flex flex-col items-center px-4 py-12 md:py-16">
            <div className="w-full max-w-[600px] flex flex-col gap-10">

                <header className="flex flex-row justify-between items-center border-b border-black/10 pb-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-serif text-h3 text-ink">correspondence.</h1>
                        <p className="text-body-sm text-ink-secondary">{user?.email}</p>
                    </div>
                    <Image src="/Logo.png" alt="postr logo" width={32} height={32} className="object-contain" />
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
                    <div className="flex justify-end">
                        <Button onClick={() => setShowNewDialogue(true)} variant="outline" className="w-full sm:w-auto">
                            start a correspondence
                        </Button>
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-body-sm text-ink-secondary pt-8">loading...</p>
                ) : conversations.length === 0 ? (
                    <p className="text-center text-body-sm text-ink-secondary pt-8">
                        no active conversations yet.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {conversations.map((c, index) => {
                            const hasUnread = c.latestPostcard && c.latestPostcard.senderId !== user?.id;

                            return (
                                <Link
                                    href={`/conversation/${c.id}`}
                                    key={c.id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="group bg-white p-5 rounded-md shadow-sm border border-neutral-100 motion-safe:animate-fade-in-up-card hover:border-black/20 hover:shadow-md transition-all duration-250 ease-subtle flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative"
                                >
                                    {/* Unread dot */}
                                    {hasUnread && (
                                        <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-pulse" />
                                    )}

                                    <div className="flex flex-col gap-1 pr-6 flex-1 min-w-0">
                                        <h3 className="font-serif text-lg truncate text-ink">
                                            {c.otherUser.name}
                                        </h3>
                                        {c.latestPostcard ? (
                                            <p className="text-body-sm text-ink-secondary truncate">
                                                {c.latestPostcard.senderId === user?.id ? "You: " : ""}
                                                {c.latestPostcard.message}
                                            </p>
                                        ) : (
                                            <p className="text-body-sm text-ink-secondary italic">Empty conversation</p>
                                        )}
                                    </div>

                                    <div className="text-xs text-[#a0978d] mt-2 sm:mt-0 flex-shrink-0">
                                        {c.latestPostcard
                                            ? new Date(c.latestPostcard.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                            : new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                        }
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

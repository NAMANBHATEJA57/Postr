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
    senderId?: string;
    sender?: { id: string; name: string };
}

interface Conversation {
    id: string;
    otherUser: { name: string; email: string };
    postcards: PostcardData[];
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

                // Sort postcards chronologically (oldest to newest for threading)
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

    if (loading) return <main className="min-h-dvh flex items-center justify-center"><p className="text-body-sm text-ink-secondary">loading correspondence...</p></main>;
    if (error) return <main className="min-h-dvh flex items-center justify-center"><p className="text-body-sm text-red-500">{error}</p></main>;
    if (!conversation) return null;

    return (
        <main className="min-h-dvh flex flex-col items-center px-4 py-8 md:py-16">
            <div className="w-full max-w-[600px] flex flex-col gap-16">

                {/* Header */}
                <header className="flex flex-row items-center border-b border-black/10 pb-6 gap-4 sticky top-0 bg-linen/90 backdrop-blur-sm z-10 pt-4">
                    <Link href="/dashboard" className="text-ink-secondary hover:text-ink transition-colors flex items-center justify-center bg-white border border-neutral-200 rounded-full w-8 h-8 shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <div className="flex flex-col gap-1 flex-1">
                        <h1 className="font-serif text-h4 text-ink truncate">{conversation.otherUser.name}</h1>
                        <p className="text-xs text-ink-secondary font-sans truncate">{conversation.otherUser.email}</p>
                    </div>
                    <Image src="/Logo.png" alt="postr logo" width={28} height={28} className="object-contain" />
                </header>

                {/* Thread */}
                <div className="flex flex-col gap-20 pb-8">
                    {conversation.postcards.length === 0 ? (
                        <div className="text-center text-ink-secondary py-12">
                            <p className="text-body-sm mb-4">No postcards sent yet.</p>
                            <Image src="/Logo.png" alt="postr icon" width={32} height={32} className="mx-auto opacity-30 mix-blend-multiply" />
                        </div>
                    ) : (
                        conversation.postcards.map((pc) => {
                            const isMe = pc.senderId === user?.id;

                            return (
                                <div key={pc.id} className="flex flex-col gap-4">
                                    <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                                        <span className="text-xs text-ink-secondary uppercase tracking-wider font-semibold">
                                            {isMe ? "You" : pc.sender?.name || pc.fromName}
                                        </span>
                                    </div>

                                    {/* Reuse the 3D flip component */}
                                    <PostcardContainer postcard={{ ...pc, fromName: (pc.sender?.name || pc.fromName) ?? "Unknown", toName: conversation.otherUser.name, isPasswordProtected: false, expiryAt: null }} />

                                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                        <span className="text-[10px] text-[#C7C0B8] tracking-widest font-sans mt-1">
                                            {new Date(pc.createdAt).toLocaleDateString(undefined, {
                                                month: 'long', day: 'numeric', year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div ref={bottomRef} className="h-10" />

                {/* Reply Action */}
                <div className="flex justify-center pb-24">
                    <Link
                        href={`/create?conversationId=${conversation.id}`}
                        className="inline-flex items-center justify-center bg-accent text-white font-sans text-body-sm tracking-ui px-8 py-3 rounded-sm min-h-[44px] hover:bg-[#958879] transition-colors shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200"
                    >
                        Write a new postcard →
                    </Link>
                </div>

            </div>
        </main>
    );
}

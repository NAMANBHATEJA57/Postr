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

export default function ConversationThreadPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.id as string;
    const { user, loading: authLoading } = useAuth();

    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteToast, setDeleteToast] = useState("");

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!loading && conversation?.postcards.length) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [conversation?.postcards.length, loading]);

    useEffect(() => {
        if (!user) return; // Wait until authenticated
        async function loadThread() {
            try {
                const res = await fetch(apiUrl(`/api/conversations/${conversationId}`), {
                    credentials: "include",
                    cache: "no-store",
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
        <main className="min-h-dvh bg-[#F8F4EF] flex items-center justify-center">
            <p className="font-sans text-sm text-accent-muted opacity-70">opening…</p>
        </main>
    );
    if (error) return (
        <main className="min-h-dvh bg-[#F8F4EF] flex items-center justify-center">
            <p className="font-sans text-sm text-red-500">{error}</p>
        </main>
    );
    if (!conversation) return null;

    return (
        <main
            className={`min-h-dvh bg-[#F8F4EF] transition-all duration-200 ease-out ${isDeleting ? "opacity-0 -translate-y-[6px]" : "opacity-100 translate-y-0 animate-[pageEnter_200ms_ease-out_both]"}`}
        >
            {/* ── Page container — matches dashboard ── */}
            <div className="max-w-[720px] mx-auto pt-16 pb-20 px-6">
                {/* ── Card wrapper — matches dashboard ── */}
                <div className="bg-white/60 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] p-8">

                    {/* ── Header row ── */}
                    <header className="flex items-center justify-between w-full mb-5">
                        {/* Left: back link */}
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-1 font-sans text-sm text-[#6B635A] no-underline transition-colors duration-150 shrink-0 hover:text-ink"
                        >
                            <Icon name="chevron_left" size={16} />
                            conversations
                        </Link>

                        {/* Center: conversation name */}
                        <h1 className="font-serif text-[1.0625rem] font-normal italic text-ink m-0 flex-1 text-center overflow-hidden text-ellipsis whitespace-nowrap px-3">
                            {conversation.otherUser.name.toLowerCase()}
                        </h1>

                        {/* Right: delete action */}
                        <div className="shrink-0 flex justify-end">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center font-sans text-[13px] text-ink-muted bg-transparent border-none p-0 cursor-pointer transition-all duration-150 opacity-60 hover:opacity-100 hover:text-ink group"
                            >
                                <Icon name="delete" size={16} className="font-light" />
                                <span className="ml-[6px] inline-block">delete</span>
                            </button>
                        </div>
                    </header>

                    {/* ── Header divider — matches dashboard ── */}
                    <div className="border-t border-[#E8E4DF] mb-8" />

                    {/* ── Thread ── */}
                    {conversation.postcards.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="font-serif text-base italic text-ink-secondary opacity-60 m-0">
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
                                        className="mb-10"
                                        style={{
                                            animation: `fadeInUpCard 250ms ${index * 60}ms both`,
                                        }}
                                    >
                                        {/* Date divider */}
                                        {showDivider && (
                                            <div className="flex items-center gap-3 mb-7">
                                                <div className="flex-1 h-px bg-[#E8E4DF]" />
                                                <span className="font-sans text-[11px] text-ink-muted tracking-[0.06em] uppercase shrink-0">
                                                    {day}
                                                </span>
                                                <div className="flex-1 h-px bg-[#E8E4DF]" />
                                            </div>
                                        )}

                                        {/* Sender label */}
                                        <p className={`font-serif text-[15px] text-ink-secondary italic mb-3 ${isMe ? "text-right" : "text-left"}`}>
                                            {senderName}
                                        </p>

                                        {/* Postcard */}
                                        <div className={`${isMe ? "ml-6 mr-0" : "ml-0 mr-6"}`}>
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
                    <div className="border-t border-[#E8E4DF] pt-7 mt-8">
                        <a
                            href={`/create?conversationId=${conversation.id}`}
                            className="flex items-center justify-center w-full h-12 bg-ink text-linen font-sans text-sm tracking-[0.02em] no-underline rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-all duration-150 select-none hover:bg-[#111111] active:scale-[0.98] active:bg-[#111111]"
                        >
                            send another postcard
                        </a>
                        <p className="font-sans text-xs text-accent-muted text-center mt-3 tracking-[0.02em]">
                            this conversation is saved in your account.
                        </p>
                    </div>

                </div>
            </div>

            {/* ── Soft Delete Confirmation Modal ── */}
            {showDeleteModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#F8F4EF]/50 backdrop-blur-[2px] animate-[fadeIn_180ms_ease_both]"
                >
                    <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] p-9 w-full max-w-[400px] text-center animate-[fadeInUpCard_220ms_ease_both]">
                        <p className="font-serif text-lg font-normal text-ink mb-2">
                            delete this conversation?
                        </p>
                        <p className="font-sans text-sm text-ink-muted mb-8 leading-[1.5]">
                            This will remove all letters inside.
                        </p>
                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="font-sans text-sm text-ink-muted bg-transparent border-none cursor-pointer p-2 transition-colors duration-150 hover:text-ink"
                            >
                                cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="font-sans text-sm text-[#C08497] bg-transparent border-none cursor-pointer p-2 transition-opacity duration-150 hover:opacity-70"
                            >
                                delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Soft Error Toast ── */}
            {deleteToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-ink text-linen px-5 py-2.5 rounded-lg font-sans text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] animate-[fadeInUp_200ms_ease_both]">
                    {deleteToast}
                </div>
            )}
        </main>
    );
}

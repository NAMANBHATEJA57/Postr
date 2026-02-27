"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EnvelopeAnimation from "@/components/envelope/EnvelopeAnimation";
import PostcardRenderer from "@/components/postcard/PostcardRenderer";
import PasswordGate from "@/components/postcard/PasswordGate";
import { ApiPostcardResponse } from "@/types/postcard";

interface ViewClientProps {
    postcardId: string;
    initialData: ApiPostcardResponse | null;
    status: number;
}

export default function ViewClient({ postcardId, initialData, status }: ViewClientProps) {
    const searchParams = useSearchParams();
    const isCreator = searchParams.get("created") === "true";

    const [phase, setPhase] = useState<"loading" | "password" | "envelope" | "reveal">(
        () => {
            if (status === 401) return "password";
            if (initialData) return isCreator ? "reveal" : "envelope";
            return "loading";
        }
    );
    const [postcard, setPostcard] = useState<ApiPostcardResponse | null>(initialData);
    const [shareUrl, setShareUrl] = useState("");

    useEffect(() => {
        setShareUrl(window.location.origin + `/p/${postcardId}`);
    }, [postcardId]);

    const fetchPostcard = async () => {
        const res = await fetch(`/api/postcards/${postcardId}`);
        if (res.ok) {
            const data = await res.json();
            setPostcard(data);
            setPhase("envelope");
        }
    };

    const handleUnlocked = () => {
        fetchPostcard();
    };

    const handleEnvelopeOpen = () => {
        setPhase("reveal");
    };

    if (phase === "loading") {
        return (
            <div className="min-h-dvh flex items-center justify-center">
                <span className="text-body-sm text-accent-muted">Loading…</span>
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
            <div className="min-h-dvh px-5 py-12 md:py-16">
                {isCreator && (
                    <div className="w-full max-w-postcard mx-auto mb-8 p-4 border border-divider">
                        <p className="text-body-sm text-ink-secondary mb-2">
                            Share this link with {postcard.toName}:
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="text-body-sm text-ink truncate flex-1">{shareUrl}</span>
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="text-body-sm text-accent hover:text-ink transition-colors flex-shrink-0"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
                <PostcardRenderer postcard={postcard} />
            </div>
        );
    }

    return null;
}

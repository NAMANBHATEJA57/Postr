"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { apiUrl } from "@/lib/api";
import { ApiPostcardResponse } from "@/types/postcard";
import { ViewPostcardSkeleton } from "@/components/postcards/PostcardSkeleton";

const ViewPrivateClient = dynamic(() => import("./ViewPrivateClient"), {
  loading: () => <ViewPostcardSkeleton />,
  ssr: false,
});

export default function ViewPageClient({ id, spaceId }: { id: string; spaceId: string }) {
    const [data, setData] = useState<ApiPostcardResponse | null>(null);
    const [status, setStatus] = useState<number | null>(null);

    useEffect(() => {
        // 1. Populate immediately from localStorage cache for instant visual render
        if (typeof window !== "undefined") {
            const cached = localStorage.getItem(`dearly_cache_post_${id}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setData(parsed);
                    setStatus(200);
                } catch (e) {
                    console.error("Failed to parse cached postcard:", e);
                }
            }
        }

        if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
            setStatus(404);
            return;
        }

        async function fetchPostcard() {
            try {
                const url = apiUrl(`/api/postcards/${id}`);
                const res = await fetch(url, { cache: "no-store" });
                const json = res.ok ? await res.json() : null;
                
                setStatus(res.status);
                if (json) {
                    setData(json);
                    if (typeof window !== "undefined") {
                        localStorage.setItem(`dearly_cache_post_${id}`, JSON.stringify(json));
                    }
                }
            } catch {
                const hasCache = typeof window !== "undefined" && !!localStorage.getItem(`dearly_cache_post_${id}`);
                if (!hasCache) {
                    setStatus(500);
                }
            }
        }
        fetchPostcard();
    }, [id]);

    if (status === null) {
        return <ViewPostcardSkeleton />;
    }

    if (status === 404) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <h1 className="font-serif text-[2rem] text-[#1a1a1a]">Not found.</h1>
            </main>
        );
    }

    if (status === 410) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-[480px] mx-auto flex flex-col gap-4 text-center">
                    <h1 className="font-serif text-[2rem] text-[#1a1a1a]">This moment has faded</h1>
                    <p className="font-sans text-[14px] text-[#6b5f56]">
                        The postcard has expired and can no longer be viewed.
                    </p>
                    <a href={`/private/${spaceId}`} className="font-sans text-[14px] text-[#1a1a1a] underline mt-4">
                        back to channel →
                    </a>
                </div>
            </main>
        );
    }

    if (status === 500) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-[480px] mx-auto flex flex-col gap-4 text-center">
                    <h1 className="font-serif text-[2rem] text-[#1a1a1a]">Something went wrong.</h1>
                    <p className="font-sans text-[14px] text-[#6b5f56]">
                        We couldn&apos;t load this postcard. Please try again.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <ViewPrivateClient
                postcardId={id}
                spaceId={spaceId}
                initialData={data}
                status={status}
            />
        </main>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiUrl } from "@/lib/api";
import PostcardGrid from "@/components/postcards/PostcardGrid";
import { PostcardGridSkeleton } from "@/components/postcards/PostcardSkeleton";
import type { ApiPostcardResponse } from "@/types/postcard";

interface SpaceResponse {
  space: {
    id: string;
    createdAt: string;
    postcards: ApiPostcardResponse[];
  };
}

export default function PrivateSpacePage({ params }: { params: { spaceId: string } }) {
  const [space, setSpace] = useState<SpaceResponse["space"] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Populate immediately from localStorage cache for instant visual render
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(`dearly_cache_space_${params.spaceId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSpace(parsed);
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse cached private space:", e);
        }
      }
    }

    async function loadSpace() {
      try {
        const res = await fetch(apiUrl(`/api/postcards/space/${params.spaceId}`), {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load private space");
        
        // Sort newest first
        if (data.space?.postcards) {
          data.space.postcards.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setSpace(data.space);

        if (typeof window !== "undefined") {
          localStorage.setItem(`dearly_cache_space_${params.spaceId}`, JSON.stringify(data.space));
        }
      } catch (err) {
        const hasCache = typeof window !== "undefined" && !!localStorage.getItem(`dearly_cache_space_${params.spaceId}`);
        if (!hasCache) {
          setError(err instanceof Error ? err.message : "Failed to load private space");
        }
      } finally {
        setLoading(false);
      }
    }

    loadSpace();
  }, [params.spaceId]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const isEmpty = space?.postcards?.length === 0;

  return (
    <main className="min-h-dvh bg-[#f8f4ef] flex flex-col items-center">
      {/* NAVBAR */}
      <nav className="w-full flex h-[80px] items-center justify-between px-6 md:px-10 max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center gap-[12px]">
          <Image
            src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png"
            alt="Dearly logo"
            width={38}
            height={28}
            className="object-contain"
          />
          <span className="font-serif text-[24px] font-bold text-[#1a1a1a] tracking-tight">Dearly</span>
        </Link>

        {/* Center Navbar Items */}
        <div className="hidden md:flex items-center gap-[32px] text-[#4a4a4a] text-[14px] font-sans font-medium">
          <button 
            onClick={() => copyToClipboard(params.spaceId.toUpperCase())}
            className="flex items-center gap-[8px] hover:text-[#1a1a1a] transition-colors"
          >
            {params.spaceId.toUpperCase()} <span className="material-symbols-rounded text-[18px]">content_copy</span>
          </button>
          <button 
            onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/private/${params.spaceId}` : '')}
            className="flex items-center gap-[8px] hover:text-[#1a1a1a] transition-colors"
          >
            Share Space link <span className="material-symbols-rounded text-[18px]">link</span>
          </button>
        </div>

        {/* Right side placeholder or button */}
        <div className="flex items-center justify-end w-[180px]">
          {!isEmpty && !loading && !error && (
            <Link
              href={`/private/${params.spaceId}/create`}
              className="hidden md:inline-flex items-center justify-center rounded-[8px] bg-[#1a1a1a] px-[16px] py-[10px] font-sans text-[13px] font-medium text-white shadow-sm hover:bg-black transition-colors"
            >
              Create your postcard
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Sub-navbar for controls (since they are hidden on mobile above) */}
      <div className="md:hidden flex flex-wrap items-center justify-center gap-4 py-4 px-6 w-full text-[#4a4a4a] text-[13px] font-sans font-medium border-b border-[#eadfd5]/50">
        <button 
          onClick={() => copyToClipboard(params.spaceId.toUpperCase())}
          className="flex items-center gap-[6px]"
        >
          {params.spaceId.toUpperCase()} <span className="material-symbols-outlined text-[14px]">content_copy</span>
        </button>
        <button 
          onClick={() => copyToClipboard(typeof window !== 'undefined' ? `${window.location.origin}/private/${params.spaceId}` : '')}
          className="flex items-center gap-[6px]"
        >
          Share link <span className="material-symbols-outlined text-[14px]">link</span>
        </button>
        {!isEmpty && !loading && !error && (
          <Link
            href={`/private/${params.spaceId}/create`}
            className="flex items-center gap-[6px] text-[#1a1a1a] underline"
          >
            Write a postcard
          </Link>
        )}
      </div>

      {/* BODY */}
      <div className="w-full max-w-[1200px] mx-auto px-4 py-[40px] md:py-[60px] flex flex-col flex-1">
        {loading && !space ? (
          <PostcardGridSkeleton />
        ) : error ? (
          <div className="flex-1 flex items-center justify-center font-sans text-[14px] text-[#b34f3f]">
            {error}
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-[10vh]">
            <h1 className="font-serif font-bold text-[48px] md:text-[56px] text-[#1a1a1a] tracking-tight mb-[12px] leading-none">
              Nothing here yet
            </h1>
            <p className="font-sans text-[15px] text-[#888888] mb-[40px]">
              This space is waiting for its first moment.
            </p>
            <Link
              href={`/private/${params.spaceId}/create`}
              className="inline-flex items-center justify-center rounded-[8px] bg-[#1a1a1a] px-[32px] py-[16px] font-sans text-[15px] text-[#f8f4ef] transition hover:bg-black shadow-md"
            >
              Write a postcard 💌
            </Link>
          </div>
        ) : (
          <div className="w-full pb-[10vh]">
            <PostcardGrid
              postcards={space?.postcards ?? []}
              emptyTitle="Nothing here yet"
              emptyCopy="This space is waiting for its first moment."
            />
          </div>
        )}
      </div>
    </main>
  );
}

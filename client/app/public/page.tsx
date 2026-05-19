"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiUrl } from "@/lib/api";
import type { ApiPostcardResponse } from "@/types/postcard";
import PostcardGrid from "@/components/postcards/PostcardGrid";
import { PostcardGridSkeleton } from "@/components/postcards/PostcardSkeleton";

export default function PublicPage() {
  const [postcards, setPostcards] = useState<ApiPostcardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Populate immediately from localStorage cache for instant visual render
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("dearly_cache_public_feed");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPostcards(parsed);
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse cached public postcards:", e);
        }
      }
    }

    async function loadPublicFeed() {
      try {
        const res = await fetch(apiUrl("/api/postcards/public"), { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load public postcards");
        
        setPostcards(data.postcards);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("dearly_cache_public_feed", JSON.stringify(data.postcards));
        }
      } catch (err) {
        const hasCache = typeof window !== "undefined" && !!localStorage.getItem("dearly_cache_public_feed");
        if (!hasCache) {
          setError(err instanceof Error ? err.message : "Failed to load public postcards");
        }
      } finally {
        setLoading(false);
      }
    }

    loadPublicFeed();
  }, []);

  const isEmpty = postcards.length === 0;

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
          <span className="text-[#888888] font-normal">Public Garden</span>
        </div>

        {/* Right side placeholder or button */}
        <div className="flex items-center justify-end w-[180px]">
          {!isEmpty && !loading && !error && (
            <Link
              href="/public/create"
              className="hidden md:inline-flex items-center justify-center rounded-[8px] bg-[#1a1a1a] px-[16px] py-[10px] font-sans text-[13px] font-medium text-white shadow-sm hover:bg-black transition-colors"
            >
              Share a postcard
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Sub-navbar for controls */}
      <div className="md:hidden flex flex-wrap items-center justify-center gap-4 py-4 px-6 w-full text-[#4a4a4a] text-[13px] font-sans font-medium border-b border-[#eadfd5]/50">
        <span className="text-[#888888] font-normal">Public Garden</span>
        {!isEmpty && !loading && !error && (
          <Link
            href="/public/create"
            className="flex items-center gap-[6px] text-[#1a1a1a] underline font-medium"
          >
            Write a postcard
          </Link>
        )}
      </div>

      {/* BODY */}
      <div className="w-full max-w-[1200px] mx-auto px-4 py-[40px] md:py-[60px] flex flex-col flex-1">
        {loading && postcards.length === 0 ? (
          <PostcardGridSkeleton />
        ) : error ? (
          <div className="flex-1 flex items-center justify-center font-sans text-[14px] text-[#b34f3f]">
            {error}
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center pb-[10vh]">
            <h1 className="font-serif font-bold text-[48px] md:text-[56px] text-[#1a1a1a] tracking-tight mb-[12px] leading-none">
              No postcards yet
            </h1>
            <p className="font-sans text-[15px] text-[#888888] mb-[40px]">
              Be the first to leave a moment.
            </p>
            <Link
              href="/public/create"
              className="inline-flex items-center justify-center rounded-[8px] bg-[#1a1a1a] px-[32px] py-[16px] font-sans text-[15px] text-[#f8f4ef] transition hover:bg-black shadow-md"
            >
              Share a postcard 💌
            </Link>
          </div>
        ) : (
          <div className="w-full pb-[10vh]">
            <div className="mb-[40px]">
              <h1 className="font-serif font-bold text-[48px] md:text-[56px] text-[#1a1a1a] tracking-tight leading-none mb-[12px]">
                an open garden.
              </h1>
              <p className="font-sans text-[15px] text-[#888888]">
                leave something for the world to discover.
              </p>
            </div>
            <PostcardGrid
              postcards={postcards}
              emptyTitle="No postcards yet"
              emptyCopy="Be the first to leave a moment."
            />
          </div>
        )}
      </div>
    </main>
  );
}

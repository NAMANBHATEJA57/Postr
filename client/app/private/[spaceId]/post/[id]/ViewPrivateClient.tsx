"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PasswordGate from "@/components/postcard/PasswordGate";
import PostcardRenderer from "@/components/postcard/PostcardRenderer";
import FrontSide from "@/components/postcard/FrontSide";
import BackSide from "@/components/postcard/BackSide";
import { apiUrl } from "@/lib/api";
import type { ApiPostcardResponse } from "@/types/postcard";

interface ViewPrivateClientProps {
  postcardId: string;
  spaceId: string;
  initialData: ApiPostcardResponse | null;
  status: number;
}

function daysUntil(isoDate: string) {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ViewPrivateClient({ postcardId, spaceId, initialData, status }: ViewPrivateClientProps) {
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<"loading" | "password" | "envelope" | "reveal">("loading");
  const [postcard, setPostcard] = useState<ApiPostcardResponse | null>(initialData);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"flip" | "full">("flip");

  useEffect(() => {
    if (status === 401) {
      setPhase("password");
      return;
    }
    if (initialData) {
      setPhase("reveal");
    }
  }, [initialData, status]);

  useEffect(() => {
    setShareUrl(typeof window !== "undefined" ? `${window.location.origin}/private/${spaceId}/post/${postcardId}` : "");
    const savedMode = localStorage.getItem("dearly_viewMode");
    if (savedMode === "flip" || savedMode === "full") {
      setViewMode(savedMode);
    }
  }, [postcardId, spaceId]);

  async function fetchPostcard(token?: string) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(apiUrl(`/api/postcards/${postcardId}`), {
      credentials: "include",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      setPostcard(data);
      setPhase("reveal");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy postcard link:", err);
    }
  }

  const handleViewModeChange = (mode: "flip" | "full") => {
    setViewMode(mode);
    localStorage.setItem("dearly_viewMode", mode);
  };

  if (phase === "loading") {
    return <div className="min-h-dvh flex items-center justify-center text-[14px] text-[#6f6258]">Loading...</div>;
  }

  if (phase === "password") {
    return <PasswordGate postcardId={postcardId} onUnlocked={fetchPostcard} />;
  }

  if (!postcard) return null;

  return (
    <div className="min-h-dvh bg-[#f8f4ef] flex flex-col items-center pb-[100px]">
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
            onClick={() => copyLink()}
            className="flex items-center gap-[8px] hover:text-[#1a1a1a] transition-colors"
          >
            {spaceId.toUpperCase()} <span className="material-symbols-rounded text-[18px]">content_copy</span>
          </button>
          <button 
            onClick={() => copyLink()}
            className="flex items-center gap-[8px] hover:text-[#1a1a1a] transition-colors"
          >
            {copied ? (
              <span className="text-[#8b7364] flex items-center gap-1 font-sans text-[13px] font-medium">
                <span className="material-symbols-rounded text-[16px]">check</span>
                link copied
              </span>
            ) : (
              <>
                Share Space link <span className="material-symbols-rounded text-[18px]">link</span>
              </>
            )}
          </button>
        </div>

        {/* Right side placeholder */}
        <div className="hidden md:block w-[140px]" />
      </nav>

      {/* Mobile Sub-navbar for controls */}
      <div className="md:hidden flex flex-wrap items-center justify-center gap-4 py-4 px-6 w-full text-[#4a4a4a] text-[13px] font-sans font-medium border-b border-[#eadfd5]/50">
        <button 
          onClick={() => copyLink()}
          className="flex items-center gap-[6px] text-[#4a4a4a]"
        >
          {copied ? (
            <span className="text-[#8b7364] flex items-center gap-1 font-sans text-[13px] font-medium">
              <span className="material-symbols-rounded text-[14px]">check</span>
              link copied
            </span>
          ) : (
            <>
              Share link <span className="material-symbols-outlined text-[14px]">link</span>
            </>
          )}
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-[880px] flex-col items-center px-4 pt-[40px] md:pt-[60px]">
        {/* HEADER */}
        <div className="text-center mb-[40px] flex flex-col items-center">
          <h1 className="font-serif font-bold text-[48px] md:text-[56px] text-[#1a1a1a] tracking-tight leading-[1.1] mb-[12px]">
            a postcard<br />from {postcard.fromName.toLowerCase()}.
          </h1>
          <p className="font-sans text-[14px] text-[#888888] italic">
            to {postcard.toName}.
          </p>
        </div>

        {/* VIEW MODE TOGGLE */}
        <div className="flex items-center p-[4px] rounded-full border border-[#eadfd5] w-fit mb-[48px] bg-transparent">
          <button
            type="button"
            onClick={() => handleViewModeChange("flip")}
            className={`rounded-full px-[24px] py-[8px] text-[13px] font-sans transition-all ${viewMode === "flip" ? "bg-white text-[#1a1a1a] shadow-sm font-medium" : "text-[#888888] hover:text-[#1a1a1a]"}`}
          >
            Flip Mode
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("full")}
            className={`rounded-full px-[24px] py-[8px] text-[13px] font-sans transition-all ${viewMode === "full" ? "bg-white text-[#1a1a1a] shadow-sm font-medium" : "text-[#888888] hover:text-[#1a1a1a]"}`}
          >
            Full Mode
          </button>
        </div>

        {/* POSTCARD DISPLAY */}
        <div className="w-full">
          {viewMode === "flip" ? (
            <PostcardRenderer postcard={postcard} />
          ) : (
            <div className="mx-auto flex max-w-[640px] flex-col gap-4">
              <div className="aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-[16px] shadow-[0_8px_30px_rgba(88,61,44,0.08)] border border-[#eadfd5]/50">
                <FrontSide postcard={postcard} />
              </div>
              <div className="aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-[16px] shadow-[0_8px_30px_rgba(88,61,44,0.08)] border border-[#eadfd5]/50">
                <BackSide postcard={postcard} />
              </div>
            </div>
          )}
        </div>

        {/* EXPIRY INFO */}
        {postcard.expiryAt && (
          <p className="mt-[32px] font-sans text-[14px] text-[#888888]">
            this postcard will fade in {daysUntil(postcard.expiryAt)} days
          </p>
        )}

        {/* FOOTER CTA BUTTONS */}
        <div className="mt-[64px] flex flex-col sm:flex-row items-center justify-center gap-[16px] w-full max-w-[480px]">
          <Link 
            href={`/private/${spaceId}/create`} 
            className="w-full sm:flex-1 px-[24px] py-[16px] rounded-[8px] border border-[#1a1a1a] bg-transparent font-sans text-[14px] text-[#1a1a1a] transition hover:bg-black/5 text-center"
          >
            Create your own postcard
          </Link>
          <Link 
            href={`/private/${spaceId}`} 
            className="w-full sm:flex-1 px-[24px] py-[16px] rounded-[8px] border border-[#1a1a1a] bg-transparent font-sans text-[14px] text-[#1a1a1a] transition hover:bg-black/5 text-center"
          >
            Back to your space
          </Link>
        </div>
      </div>
    </div>
  );
}

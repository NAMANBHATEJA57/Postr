"use client";

import { useCallback } from "react";
import Link from "next/link";
import FrontSide from "@/components/postcard/FrontSide";
import { apiUrl } from "@/lib/api";
import type { ApiPostcardResponse } from "@/types/postcard";

interface PostcardCardProps {
  postcard: ApiPostcardResponse;
}

export default function PostcardCard({ postcard }: PostcardCardProps) {
  const isPrivate = !!postcard.spaceId;
  const targetUrl = postcard.visibility === "public" 
    ? `/public/post/${postcard.id}` 
    : (isPrivate ? `/private/${postcard.spaceId}/post/${postcard.id}` : `/p/${postcard.id}`);

  const formattedDate = new Date(postcard.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const displaySender = postcard.fromName || "anonymous";
  const displayTitle = postcard.title || formattedDate;

  const prefetchPostcard = useCallback(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(`dearly_cache_post_${postcard.id}`)) {
      fetch(apiUrl(`/api/postcards/${postcard.id}`))
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data) {
            localStorage.setItem(`dearly_cache_post_${postcard.id}`, JSON.stringify(data));
          }
        })
        .catch(() => {});
    }
  }, [postcard.id]);

  return (
    <Link
      href={targetUrl}
      onMouseEnter={prefetchPostcard}
      className="group flex flex-col transition duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full max-w-[280px] mx-auto overflow-hidden rounded-xl shadow-md bg-[#f3ebe2]">
        {postcard.mediaUrl ? (
          <FrontSide postcard={postcard} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f3ebe2]">
            <span className="font-serif text-[10px] text-[#7b6759] uppercase tracking-widest">sealed note</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 px-2 max-w-[280px] mx-auto w-full">
        <span className="font-handwritten text-[18px] text-[#1a1a1a]">From: {displaySender}</span>
        <span className="font-handwritten text-[18px] text-[#1a1a1a]">
          {displayTitle}
        </span>
      </div>
    </Link>
  );
}

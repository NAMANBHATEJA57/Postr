"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FrontSide from "@/components/postcard/FrontSide";
import BackSide from "@/components/postcard/BackSide";
import { StampId } from "@/components/stamps/StampRegistry";
import { ApiPostcardResponse } from "@/types/postcard";

interface PostcardPreviewProps {
  mediaUrl: string | null;
  mediaType: string;
  title: string;
  message: string;
  toName: string;
  fromName: string;
  stampId: StampId | null;
  mode?: "full" | "mini";
  className?: string;
}

export default function PostcardPreview({
  mediaUrl,
  mediaType,
  title,
  message,
  toName,
  fromName,
  stampId,
  mode = "full",
  className = "",
}: PostcardPreviewProps) {
  // Mock postcard object for the standard components
  const postcard: ApiPostcardResponse = {
    id: "preview",
    mediaUrl: mediaUrl || "",
    mediaType: mediaType as any,
    title,
    message,
    toName: toName || "Recipient",
    fromName: fromName || "Sender",
    stampId: stampId || null,
    theme: "framed",
    expiryAt: null,
    isPasswordProtected: false,
    visibility: "public",
    spaceId: null,
    createdAt: new Date().toISOString(),
  };

  if (mode === "mini") {
    return (
      <div 
        className={`relative w-full aspect-[3/2] rounded-[8px] overflow-hidden shadow-sm border border-divider bg-white/50 group cursor-pointer ${className}`}
      >
        <div className="absolute inset-0">
          <FrontSide postcard={postcard} />
        </div>
        
        {/* Mini Overlay for Back Details */}
        <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-sm p-3 border-t border-divider flex justify-between items-center">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[11px] text-ink-secondary font-medium tracking-wide truncate mb-0.5">
              To: {toName || "..."}
            </p>
            <p className="text-[12px] text-ink/80 italic font-serif line-clamp-1">
              "{message || "no message yet..."}"
            </p>
          </div>
          {stampId && (
            <div className="w-8 h-8 flex-shrink-0">
               <BackSide postcard={postcard} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#f8fafc] p-[24px] rounded-[8px] w-full flex flex-col gap-[16px] ${className}`}>
        {/* Front Side */}
        <div className="relative w-full aspect-[3/2] rounded-[8px] overflow-hidden border border-[#555555]/60 bg-white">
            <FrontSide postcard={postcard} />
        </div>

        {/* Back Side */}
        <div className="relative w-full aspect-[3/2] rounded-[8px] overflow-hidden border border-[#555555]/60 bg-white">
            <BackSide postcard={postcard} />
        </div>
    </div>
  );
}

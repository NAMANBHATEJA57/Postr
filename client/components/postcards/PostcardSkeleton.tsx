"use client";

import React from "react";

export function PostcardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse opacity-75">
      {/* 4:3 Aspect Ratio Block matching the exact card styling */}
      <div className="relative aspect-[4/3] w-full max-w-[280px] mx-auto overflow-hidden rounded-xl bg-[#eadfd5]/60 border border-[#eadfd5]/40 shadow-sm" />

      {/* Spacing and text placeholders below matching standard card metadata */}
      <div className="flex items-center justify-between mt-4 px-2 max-w-[280px] mx-auto w-full">
        {/* From Name Placeholder */}
        <div className="h-[14px] w-24 bg-[#eadfd5]/80 rounded-[4px]" />
        {/* Title/Date Placeholder */}
        <div className="h-[14px] w-16 bg-[#eadfd5]/80 rounded-[4px]" />
      </div>
    </div>
  );
}

export function PostcardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <PostcardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ViewPostcardSkeleton() {
  return (
    <div className="min-h-dvh bg-[#f8f4ef] px-4 py-12 md:px-8 md:py-16 animate-pulse opacity-75">
      <div className="mx-auto flex w-full max-w-[880px] flex-col items-center">
        {/* Navigation bar */}
        <div className="mb-14 flex w-full items-center justify-between">
          <div className="h-4 w-12 bg-[#eadfd5] rounded" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#eadfd5] rounded-full" />
            <div className="h-5 w-16 bg-[#eadfd5] rounded" />
          </div>
          <div className="w-12" />
        </div>

        {/* Title area */}
        <div className="text-center w-full max-w-[420px] flex flex-col items-center">
          <div className="h-3 w-28 bg-[#eadfd5] rounded uppercase tracking-wider mb-4" />
          <div className="h-8 w-64 bg-[#eadfd5] rounded mb-3" />
          <div className="h-4 w-48 bg-[#eadfd5] rounded" />
        </div>

        {/* Mode selector */}
        <div className="mt-8 flex flex-col items-center">
          <div className="h-10 w-44 bg-[#eadfd5]/60 rounded-full" />
          <div className="mt-4 h-3 w-24 bg-[#eadfd5]/40 rounded" />
        </div>

        {/* Postcard actual structure placeholder */}
        <div className="mt-10 w-full max-w-postcard mx-auto aspect-[4/3] sm:aspect-[3/2] rounded-xl bg-[#eadfd5]/60 border border-[#eadfd5]/40 shadow-md flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-[#8b7364]/30 animate-spin" />
        </div>
      </div>
    </div>
  );
}

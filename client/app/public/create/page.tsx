"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MediaUpload from "@/components/create/MediaUpload";
import { STAMPS, type StampId } from "@/components/stamps/StampRegistry";
import { apiUrl } from "@/lib/api";

const MESSAGE_MAX = 120;

function CreatePublicPageInner() {
  const router = useRouter();

  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [stampId, setStampId] = useState<StampId | null>(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleMediaFile = useCallback((file: File | null) => {
    setMediaFile(file);
  }, []);

  const canPublish = useMemo(() => {
    return Boolean(mediaFile || title.trim() || message.trim());
  }, [mediaFile, message, title]);

  const handlePublish = useCallback(async () => {
    if (!canPublish || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    // Create optimistic preview in local cache
    if (typeof window !== "undefined") {
      const optimisticId = `temp-${Date.now()}`;
      const localMediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : "";
      const optimisticPostcard = {
        id: optimisticId,
        mediaUrl: localMediaUrl,
        mediaType: mediaFile?.type.startsWith("video/") ? "video" : "image",
        title: title.trim(),
        message: message.trim(),
        toName: "",
        fromName: fromName.trim() || "anonymous",
        theme: "framed",
        visibility: "public",
        stampId: stampId ?? null,
        createdAt: new Date().toISOString(),
        spaceId: null,
        isOptimistic: true
      };

      const cached = localStorage.getItem("dearly_cache_public_feed");
      let feed = [] as any[];
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) feed = parsed;
        } catch {}
      }
      localStorage.setItem("dearly_cache_public_feed", JSON.stringify([optimisticPostcard, ...feed]));
    }

    try {
      let publicUrlStr = "";
      let mediaTypeStr = "";

      if (mediaFile) {
        const metaRes = await fetch(apiUrl("/api/upload"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: mediaFile.name,
            fileType: mediaFile.type,
            fileSize: mediaFile.size,
          }),
        });

        if (!metaRes.ok) throw new Error((await metaRes.json()).error ?? "Upload failed");

        const { signature, timestamp, apiKey, cloudName, publicUrl, publicId } = await metaRes.json();

        setUploading(true);
        const formData = new FormData();
        formData.append("file", mediaFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("public_id", publicId);

        const isVideo = mediaFile.type.startsWith("video/");
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? "video" : "image"}/upload`,
          { method: "POST", body: formData }
        );

        if (!uploadRes.ok) throw new Error("File upload failed");

        setUploading(false);
        publicUrlStr = publicUrl;
        mediaTypeStr = isVideo ? "video" : "image";
      }

      const createRes = await fetch(apiUrl("/api/postcards"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          mediaUrl: publicUrlStr,
          mediaType: mediaTypeStr,
          title: title.trim(),
          message: message.trim(),
          toName: "",
          fromName: fromName.trim() || "anonymous",
          theme: "framed",
          visibility: "public",
          ...(stampId ? { stampId } : {}),
          ...(password ? { password } : {}),
        }),
      });

      if (!createRes.ok) {
        throw new Error((await createRes.json()).error ?? "Failed to create postcard");
      }

      const { id } = await createRes.json();

      // Replace optimistic card with real one in cache
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("dearly_cache_public_feed");
        if (cached) {
          try {
            const feed = JSON.parse(cached);
            if (Array.isArray(feed)) {
              const updatedFeed = feed.map((card: any) => {
                if (card.id.startsWith("temp-") && card.title === title.trim()) {
                  return {
                    ...card,
                    id,
                    mediaUrl: publicUrlStr,
                    isOptimistic: false
                  };
                }
                return card;
              });
              localStorage.setItem("dearly_cache_public_feed", JSON.stringify(updatedFeed));
            }
          } catch {}
        }

        // Also pre-cache the real detail page so that opening it from the grid is instant!
        const realCardDetail = {
          id,
          mediaUrl: publicUrlStr,
          mediaType: mediaTypeStr,
          title: title.trim(),
          message: message.trim(),
          toName: "",
          fromName: fromName.trim() || "anonymous",
          theme: "framed",
          visibility: "public",
          stampId: stampId ?? null,
          createdAt: new Date().toISOString(),
          spaceId: null
        };
        localStorage.setItem(`dearly_cache_post_${id}`, JSON.stringify(realCardDetail));
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push(`/public/post/${id}?created=true`);
      }, 700);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
      setUploading(false);
    }
  }, [
    canPublish,
    fromName,
    mediaFile,
    message,
    password,
    router,
    stampId,
    submitting,
    title,
  ]);

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
          <Link href="/public" className="hover:text-[#1a1a1a] transition-colors">
            Public Garden
          </Link>
        </div>

        {/* Right side placeholder */}
        <div className="w-[32px] hidden md:block"></div>
      </nav>

      {/* FORM CONTENT */}
      <div className="w-full max-w-[480px] flex flex-col pt-[40px] pb-[100px] px-4">
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-[48px]">
          <h1 className="font-serif font-bold text-[48px] md:text-[56px] text-[#1a1a1a] leading-none tracking-tight mb-[12px]">
            share a postcard.
          </h1>
          <p className="font-sans text-[14px] text-[#888888]">
            leave something for the world to discover.
          </p>
        </div>

        {/* FIELDS */}
        <div className="flex flex-col gap-[32px]">
          {/* Add a memory */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[14px] text-[#1a1a1a]">Add a memory</label>
            <div className="w-full bg-white rounded-[12px] overflow-hidden">
              <MediaUpload onFile={handleMediaFile} />
            </div>
          </div>

          {/* Give it a title */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[14px] text-[#1a1a1a]">Give it a title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="a small note on the top"
              maxLength={60}
              className="w-full bg-white rounded-[8px] px-[16px] py-[16px] font-sans text-[15px] outline-none text-[#1a1a1a] placeholder-[#cccccc] shadow-sm"
            />
          </div>

          {/* Your message */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[14px] text-[#1a1a1a]">Your message</label>
            <div className="w-full bg-white rounded-[8px] p-[16px] shadow-sm relative border border-transparent focus-within:border-[#C08497] focus-within:ring-2 focus-within:ring-[#C08497]/30 transition-all duration-200">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                placeholder="something simple..."
                maxLength={MESSAGE_MAX}
                className="w-full min-h-[140px] resize-none bg-transparent font-sans text-[15px] text-[#1a1a1a] placeholder-[#cccccc] border-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 !focus-visible:border-transparent !focus-visible:ring-0 !focus-visible:shadow-none"
              />
              <div className="absolute bottom-[16px] right-[16px] font-sans text-[12px] text-[#cccccc]">
                {message.length}/{MESSAGE_MAX}
              </div>
            </div>
          </div>

          {/* From */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[14px] text-[#1a1a1a]">From</label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="your name"
              maxLength={60}
              className="w-full bg-white rounded-[8px] px-[16px] py-[16px] font-sans text-[15px] outline-none text-[#1a1a1a] placeholder-[#cccccc] shadow-sm"
            />
          </div>

          {/* Choose a stamp */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[14px] text-[#1a1a1a]">choose a stamp (optional)</label>
            <div className="flex flex-wrap gap-[12px]">
              {(Object.entries(STAMPS) as [StampId, typeof STAMPS[StampId]][]).map(([id, Stamp]) => {
                const isSelected = stampId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStampId(isSelected ? null : id)}
                    className={`flex h-[72px] w-[72px] items-center justify-center rounded-[8px] transition bg-white ${isSelected ? "border-[2px] border-[#f472b6]" : "border-none shadow-sm"}`}
                  >
                    <div className="h-[48px] w-[38px]">
                      <Stamp />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add a password */}
          <div className="flex flex-col gap-[8px]">
            <label className="font-sans font-medium text-[14px] text-[#1a1a1a]">Add a password (optional)</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              className="w-full bg-white rounded-[8px] px-[16px] py-[16px] font-sans text-[15px] outline-none text-[#1a1a1a] placeholder-[#cccccc] shadow-sm"
            />
            <p className="font-sans text-[12px] text-[#888888]">
              only share this if you want it to stay private
            </p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-[48px] flex flex-col items-center gap-[12px]">
          {submitError ? <p className="text-center font-sans text-[14px] text-[#b34f3f]">{submitError}</p> : null}

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || submitting || uploading || isSuccess}
            className="w-full bg-[#1a1a1a] text-white font-sans text-[15px] py-[16px] rounded-[8px] transition hover:bg-black disabled:opacity-50 shadow-md animate-none font-medium"
          >
            {isSuccess ? "Moment shared" : uploading ? "Uploading media..." : submitting ? "Sharing..." : "share postcard"}
          </button>

          <p className="font-sans text-[12px] text-[#888888]">
            this postcard will appear on the public wall
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CreatePublicPage() {
  return (
    <Suspense>
      <CreatePublicPageInner />
    </Suspense>
  );
}

"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MediaUpload from "@/components/create/MediaUpload";
import { apiUrl } from "@/lib/api";
import { ExpiryOption } from "@/types/postcard";
import { STAMPS, StampId } from "@/components/stamps/StampRegistry";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import Image from "next/image";

const MESSAGE_MAX = 120;

function computeExpiryAt(option: ExpiryOption, customDate?: string): string | null {
    const now = new Date();
    switch (option) {
        case "24h": return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        case "7d": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        case "30d": return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        case "custom": return customDate ? new Date(customDate).toISOString() : null;
        default: return null;
    }
}

function CreatePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("conversationId");
    const { user, loading: authLoading } = useAuth();
    const isGuest = !authLoading && !user;

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [toName, setToName] = useState("");
    const [fromName, setFromName] = useState("");
    const [stampId, setStampId] = useState<StampId | null>(null);
    const [expiry, setExpiry] = useState<ExpiryOption>(isGuest ? "7d" : "never");
    const [customDate, setCustomDate] = useState("");
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [password, setPassword] = useState("");

    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleMediaFile = useCallback((file: File | null) => {
        setMediaFile(file);
    }, []);

    const effectiveExpiry = isGuest ? "7d" : expiry;
    const isPublishable = (conversationId || (toName.trim() && fromName.trim())) && (mediaFile || message.trim() || title.trim());

    const handlePublish = useCallback(async () => {
        if (submitting) return;
        setSubmitting(true);
        setSubmitError(null);

        try {
            let publicUrlStr = "";
            let mediaTypeStr = "";

            if (mediaFile) {
                const metaRes = await fetch(apiUrl("/api/upload"), {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileName: mediaFile.name, fileType: mediaFile.type, fileSize: mediaFile.size }),
                });
                if (!metaRes.ok) throw new Error((await metaRes.json()).error ?? "Upload failed");
                const { signature, timestamp, apiKey, cloudName, publicUrl, publicId } = await metaRes.json();

                setUploading(true);
                const formData = new FormData();
                formData.append("file", mediaFile); formData.append("api_key", apiKey);
                formData.append("timestamp", timestamp.toString()); formData.append("signature", signature);
                formData.append("public_id", publicId);
                const isVideo = mediaFile.type.startsWith("video/");
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${isVideo ? "video" : "image"}/upload`, {
                    method: "POST", body: formData,
                });
                if (!uploadRes.ok) throw new Error("File upload to storage failed");
                setUploading(false);
                publicUrlStr = publicUrl; mediaTypeStr = isVideo ? "video" : "image";
            }

            const expiryAt = computeExpiryAt(effectiveExpiry, customDate);
            const createRes = await fetch(apiUrl("/api/postcards"), {
                method: "POST", headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    mediaUrl: publicUrlStr, mediaType: mediaTypeStr, title: title.trim(), message: message.trim(),
                    toName: conversationId ? "Recipient" : toName.trim(), fromName: conversationId ? "Sender" : fromName.trim(),
                    theme: "framed", ...(stampId ? { stampId } : {}), ...(expiryAt ? { expiryAt } : {}),
                    ...(passwordEnabled && password ? { password } : {}), ...(conversationId ? { conversationId } : {}),
                }),
            });

            if (!createRes.ok) {
                if (createRes.status === 429) throw new Error("Too many postcards. Try again later.");
                throw new Error((await createRes.json()).error ?? "Failed to create postcard");
            }
            const { id } = await createRes.json();
            setIsSuccess(true);
            setTimeout(() => {
                router.push(conversationId ? `/conversation/${conversationId}` : `/p/${id}?created=true`);
            }, 800);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong");
            setSubmitting(false); setUploading(false);
        }
    }, [mediaFile, submitting, title, message, toName, fromName, stampId, effectiveExpiry, customDate, passwordEnabled, password, router, conversationId]);

    return (
        <main className="min-h-dvh bg-[#F8F4EF] flex flex-col items-center">

            {/* ── Navigation ── */}
            <nav className="w-full h-[72px] bg-[#F8F4EF]/70 backdrop-blur-[11px] flex flex-col items-center justify-between px-[16px] md:px-[320px] relative z-50 py-0">
                {/* Logo — centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-[10px]">
                    <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" alt="Dearly logo" width={38} height={28} className="opacity-90 object-cover" />
                    <span className="font-serif font-semibold text-[24px] tracking-[-0.45px] text-[#1A1A1A]">Dearly</span>
                </div>
                {/* Back button — left */}
                <div
                    className="absolute left-[16px] md:left-[320px] top-1/2 -translate-y-1/2 flex items-center gap-[4px] cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                    onClick={() => router.back()}
                >
                    <span className="material-symbols-rounded text-[24px] text-[#555]">arrow_back</span>
                    <span className="text-[12px] font-normal tracking-[0.12px] text-[#555]">Back</span>
                </div>
            </nav>

            {/* ── Page body ── */}
            <div className="w-full max-w-[460px] flex flex-col gap-[40px] items-center px-[16px] md:px-0 py-[80px]">

                {/* ── Header ── */}
                <header className="flex flex-col items-center gap-[8px] text-center w-full">
                    <h1 className="font-serif font-semibold text-[40px] md:text-[64px] text-[#1A1A1A] tracking-[-0.45px] leading-normal">
                        send a postcard.
                    </h1>
                    <p className="text-[12px] md:text-[15px] text-[#555] opacity-80 tracking-[0.12px]">
                        keep it short. make it meaningful.
                    </p>
                    {/* Guest mode badge */}
                    {isGuest && (
                        <div className="flex items-center gap-[4px] bg-[#EAEAEA] px-[16px] py-[8px] rounded-[48px] mt-1">
                            <div className="w-[8px] h-[8px] rounded-full bg-[#555] opacity-60 shrink-0" />
                            <span className="text-[12px] text-[#555] opacity-80 tracking-[0.12px] whitespace-nowrap">
                                guest mode — disappears in 7 days
                            </span>
                        </div>
                    )}
                </header>

                {/* ── All form fields in a single flat column ── */}
                <div className="w-full flex flex-col gap-[40px]">

                    {/* ── Add a memory ── */}
                    <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                        <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">Add a memory</label>
                        <div className="bg-white rounded-[8px] overflow-hidden">
                            <MediaUpload onFile={handleMediaFile} />
                        </div>
                    </div>

                    {/* ── Give it a title ── */}
                    <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                        <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">Give it a title</label>
                        <div className="bg-white rounded-[8px] p-[12px] border border-[#E8E3DE] focus-within:border-[#FFAAF9] transition-colors">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="a small note on the top"
                                maxLength={60}
                                className="w-full bg-transparent text-[#1A1A1A] text-[16px] tracking-[0.16px] outline-none focus:ring-0 placeholder:text-[#B8BCCA] leading-[1.5]"
                            />
                        </div>
                    </div>

                    {/* ── Your message ── */}
                    <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                        <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">Your message</label>
                        <div className="bg-white rounded-[8px] p-[12px] h-[200px] flex flex-col justify-between border border-[#E8E3DE] focus-within:border-[#FFAAF9] transition-colors">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                                placeholder="something simple…"
                                maxLength={MESSAGE_MAX}
                                className="grow bg-transparent text-[#1A1A1A] text-[16px] tracking-[0.16px] leading-[1.5] outline-none focus:ring-0 placeholder:text-[#B8BCCA] resize-none"
                            />
                            <div className="flex justify-end pt-1">
                                <span className="text-[12px] text-[#B8BCCA] tracking-[0.12px]">{message.length}/{MESSAGE_MAX}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Who is this for? / From ── */}
                    {!conversationId && (
                        <>
                            <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                                <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">Who is this for?</label>
                                <div className="bg-white rounded-[8px] p-[12px] border border-[#E8E3DE] focus-within:border-[#FFAAF9] transition-colors">
                                    <input
                                        type="text"
                                        value={toName}
                                        onChange={e => setToName(e.target.value)}
                                        placeholder="their name"
                                        maxLength={60}
                                        className="w-full bg-transparent text-[#1A1A1A] text-[16px] tracking-[0.16px] outline-none focus:ring-0 placeholder:text-[#B8BCCA] leading-[1.5]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                                <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">From</label>
                                <div className="bg-white rounded-[8px] p-[12px] border border-[#E8E3DE] focus-within:border-[#FFAAF9] transition-colors">
                                    <input
                                        type="text"
                                        value={fromName}
                                        onChange={e => setFromName(e.target.value)}
                                        placeholder="your name"
                                        maxLength={60}
                                        className="w-full bg-transparent text-[#1A1A1A] text-[16px] tracking-[0.16px] outline-none focus:ring-0 placeholder:text-[#B8BCCA] leading-[1.5]"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Choose a stamp ── */}
                    <div className="flex flex-col gap-[4px] w-full">
                        <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">choose a stamp (optional)</label>
                        <div className="flex flex-wrap gap-[12px] mt-[4px]">
                            {(Object.entries(STAMPS) as [StampId, typeof STAMPS[StampId]][]).map(([id, Stamp]) => {
                                const isSelected = stampId === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setStampId(isSelected ? null : id)}
                                        className={`size-[80px] rounded-[8px] flex items-center justify-center transition-all duration-200 ${
                                            isSelected
                                                ? "bg-[#FEF6FF] ring-2 ring-[#FFAAF9] scale-[1.05]"
                                                : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.03] hover:ring-black/10 hover:scale-[1.02] active:scale-[0.98]"
                                        }`}
                                        aria-label={`Select ${id} stamp`}
                                    >
                                        <div className="w-[48px] h-[60.75px]"><Stamp /></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Duration ── */}
                    <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                        <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">Duration</label>
                        <div className="bg-[#FEF6FF] rounded-[8px] p-[12px] flex flex-col gap-[10px]">
                            <span className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5] whitespace-nowrap">
                                {isGuest ? "7 days (Temp)" : "permanent"}
                            </span>
                        </div>
                    </div>

                    {/* ── Add a password ── */}
                    <div className="flex flex-col gap-[4px] w-full overflow-hidden">
                        <label className="font-sans font-normal text-[16px] text-[#1A1A1A] tracking-[0.16px] leading-[1.5]">Add a password (optional)</label>
                        <div className="bg-white rounded-[8px] p-[12px] flex items-center justify-between border border-[#E8E3DE] focus-within:border-[#FFAAF9] transition-colors">
                            <input
                                type={passwordEnabled ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Juliet"
                                className="bg-transparent text-[#1A1A1A] text-[16px] tracking-[0.16px] outline-none focus:ring-0 placeholder:text-[#B8BCCA] w-full leading-[1.5]"
                                onClick={() => setPasswordEnabled(true)}
                            />
                            <span
                                className="material-symbols-rounded text-[#B8BCCA] hover:text-[#555] cursor-pointer text-[20px] shrink-0 transition-colors ml-2"
                                onClick={() => setPasswordEnabled(!passwordEnabled)}
                            >
                                {passwordEnabled ? "visibility" : "visibility_off"}
                            </span>
                        </div>
                    </div>

                    {/* ── CTA ── */}
                    <div className="flex flex-col items-center gap-[8px] w-full">
                        {submitError && <p className="text-sm text-red-500 w-full text-center">{submitError}</p>}
                        <button
                            onClick={handlePublish}
                            disabled={!isPublishable || submitting || uploading || isSuccess}
                            className="w-full bg-[#1A1A1A] text-[#F8F4EF] py-[16px] rounded-[8px] text-[15px] font-normal tracking-[0.3px] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-[8px]"
                        >
                            {isSuccess ? "sent ✓" : submitting ? "sending..." : uploading ? "uploading media..." : "Send a postcard"}
                        </button>
                        <p className="text-[12px] text-[#555] opacity-80 tracking-[0.12px] text-center">
                            you&apos;ll get a private link to share
                        </p>
                    </div>

                    {/* ── Account prompt ── */}
                    <div className="text-[13px] text-[#555] opacity-80 tracking-[0.13px] text-center pb-[80px]">
                        want to keep your postcards?{" "}
                        <Link href="/register" className="underline hover:text-black transition-colors">
                            create an account
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default function CreatePage() {
    return (
        <Suspense>
            <CreatePageInner />
        </Suspense>
    );
}

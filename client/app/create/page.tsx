"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import MediaUpload from "@/components/create/MediaUpload";
import ExpirySelector from "@/components/create/ExpirySelector";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CharacterCounter from "@/components/ui/CharacterCounter";
import { apiUrl } from "@/lib/api";
import { ExpiryOption } from "@/types/postcard";
import { STAMPS, StampId } from "@/components/stamps/StampRegistry";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

function computeExpiryAt(option: ExpiryOption, customDate?: string): string | null {
    const now = new Date();
    switch (option) {
        case "24h":
            return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        case "7d":
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        case "30d":
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        case "custom":
            return customDate ? new Date(customDate).toISOString() : null;
        default:
            return null;
    }
}

function CreatePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("conversationId");
    const { user, loading: authLoading } = useAuth();

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [toName, setToName] = useState("");
    const [fromName, setFromName] = useState("");
    const [stampId, setStampId] = useState<StampId | null>(null);
    const [expiry, setExpiry] = useState<ExpiryOption>("never");
    const [customDate, setCustomDate] = useState("");
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [password, setPassword] = useState("");
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleExpiryChange = (option: ExpiryOption, cd?: string) => {
        setExpiry(option);
        if (cd) setCustomDate(cd);
    };

    const isPublishable =
        mediaFile && title.trim() && message.trim() && (conversationId || (toName.trim() && fromName.trim()));

    const handlePublish = useCallback(async () => {
        if (!mediaFile || submitting) return;
        setSubmitting(true);
        setSubmitError(null);

        try {
            const metaRes = await fetch(apiUrl("/api/upload"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: mediaFile.name,
                    fileType: mediaFile.type,
                    fileSize: mediaFile.size,
                }),
            });

            if (!metaRes.ok) {
                const err = await metaRes.json();
                throw new Error(err.error ?? "Upload failed");
            }

            const { uploadUrl, publicUrl } = await metaRes.json();

            setUploading(true);
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: mediaFile,
                headers: { "Content-Type": mediaFile.type },
            });

            if (!uploadRes.ok) throw new Error("File upload to storage failed");
            setUploading(false);

            const mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
            const expiryAt = computeExpiryAt(expiry, customDate);

            const createRes = await fetch(apiUrl("/api/postcards"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    mediaUrl: publicUrl,
                    mediaType,
                    title: title.trim(),
                    message: message.trim(),
                    toName: conversationId ? "Recipient" : toName.trim(),
                    fromName: conversationId ? "Sender" : fromName.trim(),
                    theme: "framed",
                    ...(stampId ? { stampId } : {}),
                    ...(expiryAt ? { expiryAt } : {}),
                    ...(passwordEnabled && password ? { password } : {}),
                    ...(conversationId ? { conversationId } : {}),
                }),
            });

            if (!createRes.ok) {
                const err = await createRes.json();
                if (createRes.status === 429) throw new Error("Too many letters. Try again later.");
                throw new Error(err.error ?? "Failed to create letter");
            }

            const { id } = await createRes.json();
            if (conversationId) {
                router.push(`/conversation/${conversationId}`);
            } else {
                router.push(`/p/${id}?created=true`);
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong");
            setSubmitting(false);
            setUploading(false);
        }
    }, [mediaFile, submitting, title, message, toName, fromName, stampId, expiry, customDate, passwordEnabled, password, router, conversationId]);

    const buttonLabel = uploading ? "uploading…" : submitting ? "sending…" : "send it";

    return (
        <>
            <main className="min-h-dvh px-5 pb-28 md:pb-16">
                <div className="w-full max-w-[640px] mx-auto flex flex-col">

                    {/* ── Back link ── */}
                    <div style={{ paddingTop: "28px", paddingBottom: "32px" }}>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.history.length > 1) router.back();
                                else router.push("/");
                            }}
                            className="cta-link font-sans text-ink-secondary hover:text-ink transition-colors duration-150"
                            style={{ fontSize: "0.875rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            aria-label="Go back"
                        >
                            <span
                                className="material-symbols-rounded"
                                style={{ fontSize: 16, lineHeight: 1, verticalAlign: "middle" }}
                                aria-hidden="true"
                            >
                                chevron_left
                            </span>
                            {" "}back
                        </button>
                    </div>

                    {/* ── Editorial hero ── */}
                    <div
                        className="flex flex-col items-center text-center"
                        style={{ marginBottom: "48px", gap: 0 }}
                    >
                        {/* Logo */}
                        <Image
                            src="/Logo.png"
                            alt="Dearly logo"
                            width={36}
                            height={36}
                            className="object-contain"
                            priority
                            draggable={false}
                        />

                        {/* Wordmark */}
                        <a
                            href="/"
                            className="font-serif text-ink tracking-tight"
                            style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "10px", lineHeight: 1 }}
                        >
                            Dearly
                        </a>

                        {/* Heading */}
                        <h1
                            className="font-serif text-ink"
                            style={{
                                fontSize: "clamp(1.875rem, 5.5vw, 2.75rem)",
                                lineHeight: 1.2,
                                marginTop: "24px",
                                marginBottom: 0,
                                letterSpacing: "-0.01em",
                            }}
                        >
                            write your letter.
                        </h1>

                        {/* Subtext */}
                        <p
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "1rem",
                                color: "#6B635A",
                                marginTop: "12px",
                                opacity: 0.85,
                            }}
                        >
                            keep it short. make it meaningful.
                        </p>

                        {/* Guest notice */}
                        {!authLoading && !user && (
                            <p
                                style={{
                                    fontFamily: "Inter, sans-serif",
                                    fontSize: "0.8125rem",
                                    color: "#C7C0B8",
                                    marginTop: "10px",
                                }}
                            >
                                You&apos;re sending as a guest.{" "}
                                <Link
                                    href="/register"
                                    style={{ color: "#C08497", textDecoration: "underline", textUnderlineOffset: "2px" }}
                                >
                                    Join Dearly
                                </Link>{" "}
                                to keep your letters safe.
                            </p>
                        )}
                    </div>

                    {/* ── Form sections ── */}
                    <div className="flex flex-col" style={{ gap: "40px" }}>

                        {/* Media */}
                        <section>
                            <MediaUpload onFile={setMediaFile} />
                        </section>

                        <div className="h-px" style={{ background: "#E1DCD7" }} />

                        {/* Title */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <label htmlFor="title-input" className="text-body-sm text-ink-secondary">title</label>
                                <CharacterCounter current={title.length} max={40} warnAt={30} />
                            </div>
                            <input
                                id="title-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value.slice(0, 40))}
                                placeholder="Title of your letter"
                                maxLength={40}
                                required
                                className="w-full bg-transparent text-ink font-serif text-xl border-b border-divider pb-2 outline-none placeholder:text-accent-muted transition-colors duration-150"
                                style={{ borderBottomColor: "#E1DCD7" }}
                                onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#C08497"; }}
                                onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#E1DCD7"; }}
                            />
                        </div>

                        {/* Message */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <label htmlFor="message-input" className="text-body-sm text-ink-secondary">message</label>
                                <CharacterCounter current={message.length} max={120} warnAt={90} />
                            </div>
                            <textarea
                                id="message-input"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here…"
                                maxLength={120}
                                required
                                rows={3}
                                className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none placeholder:text-accent-muted resize-none transition-colors duration-150"
                                style={{ lineHeight: "1.6", borderBottomColor: "#E1DCD7" }}
                                onFocus={(e) => { e.currentTarget.style.borderBottomColor = "#C08497"; }}
                                onBlur={(e) => { e.currentTarget.style.borderBottomColor = "#E1DCD7"; }}
                            />
                        </div>

                        {/* Stamps */}
                        <div className="flex flex-col gap-3">
                            <p className="text-body-sm text-ink-secondary">add a stamp (optional)</p>
                            <div
                                className="flex items-center gap-3 overflow-x-auto pb-2 snap-x"
                                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
                            >
                                {(Object.entries(STAMPS) as [StampId, typeof STAMPS[StampId]][]).map(([id, Stamp]) => {
                                    const isSelected = stampId === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setStampId(isSelected ? null : id)}
                                            className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 snap-start flex items-center justify-center bg-white transition-all duration-150 ease-subtle cursor-pointer outline-none [&>svg]:max-w-[80%] [&>svg]:max-h-[80%] [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain"
                                            style={{
                                                border: isSelected ? "2px solid #C08497" : "1px solid #E1DCD7",
                                                transform: isSelected ? "scale(1.02)" : "scale(1)",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) e.currentTarget.style.border = "1px solid #C08497";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) e.currentTarget.style.border = "1px solid #E1DCD7";
                                            }}
                                            aria-pressed={isSelected}
                                            aria-label={`Select ${id} stamp`}
                                        >
                                            <Stamp />
                                            {isSelected && (
                                                <div
                                                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                                                    style={{ background: "#C08497" }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* To / From */}
                        {!conversationId && (
                            <>
                                <div className="h-px" style={{ background: "#E1DCD7" }} />
                                <div className="flex flex-col gap-6">
                                    <Input
                                        id="to-input"
                                        label="to"
                                        value={toName}
                                        onChange={(e) => setToName(e.target.value.slice(0, 60))}
                                        placeholder="their name"
                                        maxLength={60}
                                        required
                                    />
                                    <Input
                                        id="from-input"
                                        label="from"
                                        value={fromName}
                                        onChange={(e) => setFromName(e.target.value.slice(0, 60))}
                                        placeholder="your name"
                                        maxLength={60}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <div className="h-px" style={{ background: "#E1DCD7" }} />

                        {/* Expiry */}
                        <ExpirySelector
                            value={expiry}
                            customDate={customDate}
                            onChange={handleExpiryChange}
                        />

                        {/* Password */}
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px]">
                                <span
                                    role="checkbox"
                                    aria-checked={passwordEnabled}
                                    tabIndex={0}
                                    onClick={() => setPasswordEnabled((p) => !p)}
                                    onKeyDown={(e) => e.key === "Enter" && setPasswordEnabled((p) => !p)}
                                    className={`w-10 h-6 flex-shrink-0 relative transition-colors duration-150 cursor-pointer ${passwordEnabled ? "bg-ink" : "bg-divider"}`}
                                >
                                    <span
                                        className={`absolute top-1 h-4 w-4 bg-linen transition-all duration-150 ${passwordEnabled ? "left-5" : "left-1"}`}
                                    />
                                </span>
                                <span className="text-body-sm text-ink-secondary">keep it safe with a password</span>
                            </label>
                            {passwordEnabled && (
                                <Input
                                    id="password-input"
                                    type="password"
                                    label="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value.slice(0, 100))}
                                    placeholder="Enter a password"
                                    autoComplete="new-password"
                                />
                            )}
                        </div>

                        {submitError && (
                            <p role="alert" className="text-body-sm text-red-500">{submitError}</p>
                        )}

                        {/* Desktop submit */}
                        <div className="hidden md:block pt-2 pb-16">
                            <Button
                                onClick={handlePublish}
                                disabled={!isPublishable}
                                loading={submitting || uploading}
                                size="lg"
                                className="w-full"
                                aria-label="Send letter"
                            >
                                {buttonLabel}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Sticky bottom CTA — mobile only ── */}
            <div
                className="md:hidden fixed bottom-0 inset-x-0 z-20 px-4 py-3"
                style={{
                    background: "rgba(248,244,239,0.97)",
                    backdropFilter: "blur(8px)",
                    borderTop: "1px solid rgba(0,0,0,0.07)",
                }}
            >
                <Button
                    onClick={handlePublish}
                    disabled={!isPublishable}
                    loading={submitting || uploading}
                    size="lg"
                    className="w-full"
                    style={{ height: "48px" }}
                    aria-label="Send letter"
                >
                    {buttonLabel}
                </Button>
            </div>
        </>
    );
}

export default function CreatePage() {
    return (
        <Suspense>
            <CreatePageInner />
        </Suspense>
    );
}

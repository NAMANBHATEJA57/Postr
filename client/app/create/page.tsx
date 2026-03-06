"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import MediaUpload from "@/components/create/MediaUpload";
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
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Lock expiry to 7d for guests
    const effectiveExpiry = isGuest ? "7d" : expiry;

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

            const { signature, timestamp, apiKey, cloudName, publicUrl, publicId } = await metaRes.json();

            setUploading(true);

            const formData = new FormData();
            formData.append("file", mediaFile);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("public_id", publicId);

            const isVideo = mediaFile.type.startsWith("video/");
            const resourceTypeStr = isVideo ? "video" : "image";

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceTypeStr}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) {
                console.error(await uploadRes.text());
                throw new Error("File upload to storage failed");
            }
            setUploading(false);

            const mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
            const expiryAt = computeExpiryAt(effectiveExpiry, customDate);

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
                if (createRes.status === 429) throw new Error("Too many postcards. Try again later.");
                throw new Error(err.error ?? "Failed to create postcard");
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
    }, [mediaFile, submitting, title, message, toName, fromName, stampId, effectiveExpiry, customDate, passwordEnabled, password, router, conversationId]);

    const buttonLabel = uploading ? "uploading…" : submitting ? "sending…" : "send it";

    return (
        <>
            <main className="min-h-dvh px-5 pb-28 md:pb-16">
                <div className="w-full max-w-[640px] mx-auto flex flex-col">

                    {/* ── Back link ── */}
                    <div className="pt-7 pb-8">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.history.length > 1) router.back();
                                else router.push("/");
                            }}
                            className="cta-link font-sans text-ink-secondary hover:text-ink transition-colors duration-150 text-sm bg-transparent border-none cursor-pointer p-0"
                            aria-label="Go back"
                        >
                            <span
                                className="material-symbols-rounded text-base leading-none align-middle"
                                aria-hidden="true"
                            >
                                chevron_left
                            </span>
                            {" "}back
                        </button>
                    </div>

                    {/* ── Editorial hero ── */}
                    <div className="flex flex-col items-center text-center mb-12 gap-0">
                        {/* Logo */}
                        <Image
                            src="https://res.cloudinary.com/db4cbtzey/image/upload/v1772543945/Logo_z9pkxr.png"
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
                            className="font-serif text-ink tracking-tight text-xl font-semibold mt-2.5 leading-none"
                        >
                            Dearly
                        </a>

                        {/* Heading */}
                        <h1 className="font-serif text-ink create-hero-title">
                            send a postcard.
                        </h1>

                        {/* Subtext */}
                        <p className="create-hero-subtitle">
                            keep it short. make it meaningful.
                        </p>

                        {/* Guest notice badge */}
                        {isGuest && (
                            <div className="guest-badge">
                                <span className="guest-badge-dot" />
                                guest mode — disappears in 7 days
                            </div>
                        )}
                    </div>

                    {/* ── Form sections ── */}
                    <div className="flex flex-col gap-10">

                        {/* Media */}
                        <section className="flex flex-col gap-2">
                            <p className="text-body-sm text-ink-secondary">add a memory</p>
                            <MediaUpload onFile={setMediaFile} />
                        </section>

                        <div className="h-px bg-divider" />

                        {/* Title */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <label htmlFor="title-input" className="text-body-sm text-ink-secondary">give it a title</label>
                                <CharacterCounter current={title.length} max={40} warnAt={30} />
                            </div>
                            <input
                                id="title-input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value.slice(0, 40))}
                                placeholder="a small note for the top."
                                maxLength={40}
                                required
                                className="w-full bg-transparent text-ink font-serif text-xl border-b border-divider pb-2 outline-none placeholder:text-accent-muted transition-colors duration-150 focus:border-accent"
                            />
                        </div>

                        {/* Message */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <label htmlFor="message-input" className="text-body-sm text-ink-secondary">your message</label>
                                <CharacterCounter current={message.length} max={120} warnAt={90} />
                            </div>
                            <textarea
                                id="message-input"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="what do you want them to remember?"
                                maxLength={120}
                                required
                                rows={3}
                                className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none placeholder:text-accent-muted resize-none transition-colors duration-150 focus:border-accent"
                                style={{ lineHeight: "1.6" }}
                            />
                        </div>

                        {/* Stamps */}
                        <div className="flex flex-col gap-2">
                            <p className="text-body-sm text-ink-secondary">choose a stamp (optional)</p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "#C7C0B8", marginTop: "-4px" }}>
                                each stamp leaves its mark.
                            </p>
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
                                                transform: isSelected ? "scale(1.04)" : "scale(1)",
                                                transition: "all 180ms ease-out",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.border = "1px solid #C08497";
                                                    e.currentTarget.style.transform = "scale(1.06)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.border = "1px solid #E1DCD7";
                                                    e.currentTarget.style.transform = "scale(1)";
                                                }
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
                            {stampId && (
                                <button
                                    type="button"
                                    onClick={() => setStampId(null)}
                                    className="text-xs text-ink-muted bg-transparent border-none cursor-pointer p-0 self-start transition-colors duration-150 hover:text-ink-secondary"
                                >
                                    clear stamp
                                </button>
                            )}
                        </div>

                        {/* To / From */}
                        {!conversationId && (
                            <>
                                <div className="h-px bg-divider" />
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col gap-1">
                                        <Input
                                            id="to-input"
                                            label="who is this for?"
                                            value={toName}
                                            onChange={(e) => setToName(e.target.value.slice(0, 60))}
                                            placeholder="their name"
                                            maxLength={60}
                                            required
                                        />
                                        <p className="text-xs text-ink-ghost mt-1">
                                            we&apos;ll send them a private link.
                                        </p>
                                    </div>
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

                        <div className="h-px bg-divider" />

                        {/* Expiry / Duration */}
                        {isGuest ? (
                            <div className="flex flex-col gap-1">
                                <p className="text-body-sm text-ink-secondary">duration</p>
                                <p className="create-duration-text">
                                    7 days <span className="text-sm text-ink-ghost">(temporary)</span>
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 w-full">
                                <label htmlFor="expiry-select" className="text-body-sm text-ink-secondary">expiry</label>
                                <select
                                    id="expiry-select"
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value as ExpiryOption)}
                                    className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none focus:border-ink transition-colors duration-150 appearance-none cursor-pointer min-h-[44px]"
                                >
                                    <option value="never">Never expires</option>
                                    <option value="24h">24 hours</option>
                                    <option value="7d">7 days</option>
                                    <option value="30d">30 days</option>
                                    <option value="custom">Custom date…</option>
                                </select>
                                {expiry === "custom" && (
                                    <input
                                        type="date"
                                        value={customDate}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setCustomDate(e.target.value)}
                                        className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none focus:border-ink transition-colors duration-150 min-h-[44px]"
                                        aria-label="Custom expiry date"
                                    />
                                )}
                            </div>
                        )}

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
                                <span className="text-body-sm text-ink-secondary">add a password (optional)</span>
                            </label>
                            {!passwordEnabled && (
                                <p className="create-password-hint">
                                    only someone with the password can open it.
                                </p>
                            )}
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

                        {/* Guest conversion nudge */}
                        {isGuest && (
                            <p className="text-[13px] text-ink-ghost text-center">
                                want to keep your postcards?{" "}
                                <Link
                                    href="/register"
                                    className="text-accent underline underline-offset-2"
                                >
                                    create an account
                                </Link>
                            </p>
                        )}

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
                                style={{ opacity: !isPublishable ? 0.5 : 1 }}
                                aria-label="Send postcard"
                            >
                                {buttonLabel}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Sticky bottom CTA — mobile only ── */}
            <div className="md:hidden fixed bottom-0 inset-x-0 z-20 px-4 py-3 create-sticky-mobile">
                <Button
                    onClick={handlePublish}
                    disabled={!isPublishable}
                    loading={submitting || uploading}
                    size="lg"
                    className={`w-full h-12 ${!isPublishable ? "opacity-50" : ""}`}
                    aria-label="Send postcard"
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

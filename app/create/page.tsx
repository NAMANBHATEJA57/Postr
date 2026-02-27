"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MediaUpload from "@/components/create/MediaUpload";
import ThemeSelector from "@/components/create/ThemeSelector";
import ExpirySelector from "@/components/create/ExpirySelector";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import CharacterCounter from "@/components/ui/CharacterCounter";
import { ExpiryOption } from "@/types/postcard";

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

export default function CreatePage() {
    const router = useRouter();

    // Form state
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [toName, setToName] = useState("");
    const [fromName, setFromName] = useState("");
    const [theme, setTheme] = useState<"minimal-light" | "framed" | "full-bleed">("minimal-light");
    const [expiry, setExpiry] = useState<ExpiryOption>("never");
    const [customDate, setCustomDate] = useState("");
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [password, setPassword] = useState("");

    // UI state
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [mediaError, setMediaError] = useState<string | undefined>();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleExpiryChange = (option: ExpiryOption, cd?: string) => {
        setExpiry(option);
        if (cd) setCustomDate(cd);
    };

    const isPublishable =
        mediaFile && title.trim() && message.trim() && toName.trim() && fromName.trim();

    const handlePublish = useCallback(async () => {
        if (!mediaFile || submitting) return;
        setSubmitting(true);
        setSubmitError(null);

        try {
            // 1. Get presigned URL
            const metaRes = await fetch("/api/upload", {
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

            // 2. Upload to S3
            setUploading(true);
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: mediaFile,
                headers: { "Content-Type": mediaFile.type },
            });

            if (!uploadRes.ok) throw new Error("File upload to storage failed");
            setUploading(false);

            // 3. Create postcard record
            const mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
            const expiryAt = computeExpiryAt(expiry, customDate);

            const createRes = await fetch("/api/postcards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mediaUrl: publicUrl,
                    mediaType,
                    title: title.trim(),
                    message: message.trim(),
                    toName: toName.trim(),
                    fromName: fromName.trim(),
                    theme,
                    expiryAt,
                    password: passwordEnabled && password ? password : undefined,
                }),
            });

            if (!createRes.ok) {
                const err = await createRes.json();
                if (createRes.status === 429) {
                    throw new Error("Too many postcards. Try again later.");
                }
                throw new Error(err.error ?? "Failed to create postcard");
            }

            const { id } = await createRes.json();
            router.push(`/p/${id}?created=true`);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Something went wrong");
            setSubmitting(false);
            setUploading(false);
        }
    }, [mediaFile, submitting, title, message, toName, fromName, theme, expiry, customDate, passwordEnabled, password, router]);

    return (
        <main className="min-h-dvh px-5 py-12 md:py-16">
            <div className="w-full max-w-postcard mx-auto flex flex-col gap-10">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <a href="/" className="font-serif text-ink text-xl font-semibold tracking-tight">
                        postr
                    </a>
                </header>

                <h1 className="font-serif text-h2 text-ink">Create a postcard.</h1>

                <div className="flex flex-col gap-8">
                    {/* Media */}
                    <section aria-labelledby="media-section">
                        <h2 id="media-section" className="text-body-sm text-ink-secondary tracking-ui uppercase mb-3">
                            Media
                        </h2>
                        <MediaUpload
                            onFile={setMediaFile}
                            error={mediaError}
                        />
                    </section>

                    <hr className="border-divider" />

                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                            <label htmlFor="title-input" className="text-body-sm text-ink-secondary tracking-ui uppercase">
                                Title
                            </label>
                            <CharacterCounter current={title.length} max={40} warnAt={30} />
                        </div>
                        <input
                            id="title-input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value.slice(0, 40))}
                            placeholder="A title for your moment"
                            maxLength={40}
                            required
                            className="w-full bg-transparent text-ink font-serif text-xl border-b border-divider pb-2 outline-none focus:border-ink transition-colors duration-150 placeholder:text-accent-muted"
                            aria-describedby="title-counter"
                        />
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-end">
                            <label htmlFor="message-input" className="text-body-sm text-ink-secondary tracking-ui uppercase">
                                Message
                            </label>
                            <CharacterCounter current={message.length} max={120} warnAt={90} />
                        </div>
                        <textarea
                            id="message-input"
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 120))}
                            placeholder="Write something quiet and true."
                            maxLength={120}
                            required
                            rows={3}
                            className="w-full bg-transparent text-ink text-body-lg font-sans border-b border-divider pb-2 outline-none focus:border-ink transition-colors duration-150 placeholder:text-accent-muted resize-none overflow-hidden"
                            style={{ lineHeight: "1.6" }}
                        />
                    </div>

                    {/* To / From */}
                    <div className="flex flex-col gap-6">
                        <Input
                            id="to-input"
                            label="To"
                            value={toName}
                            onChange={(e) => setToName(e.target.value.slice(0, 60))}
                            placeholder="their name"
                            maxLength={60}
                            required
                        />
                        <Input
                            id="from-input"
                            label="From"
                            value={fromName}
                            onChange={(e) => setFromName(e.target.value.slice(0, 60))}
                            placeholder="your name"
                            maxLength={60}
                            required
                        />
                    </div>

                    <hr className="border-divider" />

                    {/* Theme */}
                    <ThemeSelector value={theme} onChange={setTheme} />

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
                                className={`w-10 h-6 flex-shrink-0 relative transition-colors duration-150 cursor-pointer ${passwordEnabled ? "bg-ink" : "bg-divider"
                                    }`}
                            >
                                <span
                                    className={`absolute top-1 h-4 w-4 bg-linen transition-all duration-150 ${passwordEnabled ? "left-5" : "left-1"
                                        }`}
                                />
                            </span>
                            <span className="text-body-sm text-ink-secondary tracking-ui uppercase">
                                Password protect
                            </span>
                        </label>
                        {passwordEnabled && (
                            <Input
                                id="password-input"
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value.slice(0, 100))}
                                placeholder="Enter a password"
                                autoComplete="new-password"
                            />
                        )}
                    </div>

                    {/* Error */}
                    {submitError && (
                        <p role="alert" className="text-body-sm text-red-500">
                            {submitError}
                        </p>
                    )}

                    {/* Publish */}
                    <div className="pt-4 pb-12">
                        <Button
                            onClick={handlePublish}
                            disabled={!isPublishable}
                            loading={submitting || uploading}
                            size="lg"
                            className="w-full"
                            aria-label="Publish postcard"
                        >
                            {uploading ? "Uploading…" : submitting ? "Publishing…" : "Publish postcard"}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}

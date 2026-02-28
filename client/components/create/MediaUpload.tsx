"use client";

import { useRef, useState, useCallback } from "react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

interface MediaUploadProps {
    onFile: (file: File | null) => void;
    error?: string;
}

type UploadState = "idle" | "invalid-type" | "too-large";

export default function MediaUpload({ onFile, error }: MediaUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<"image" | "video" | null>(null);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [isDragging, setIsDragging] = useState(false);

    const validateAndSet = useCallback(
        (file: File) => {
            const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
            const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

            if (!isImage && !isVideo) {
                setUploadState("invalid-type");
                return;
            }

            const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
            if (file.size > maxSize) {
                setUploadState("too-large");
                return;
            }

            setUploadState("idle");
            setFileType(isVideo ? "video" : "image");
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onFile(file);
        },
        [onFile]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSet(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSet(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setFileType(null);
        setUploadState("idle");
        onFile(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const errorMessage =
        error ??
        (uploadState === "invalid-type"
            ? "Only JPG, PNG, WebP, or MP4 files are allowed."
            : uploadState === "too-large"
                ? fileType === "video"
                    ? "Video must be under 25MB."
                    : "Image must be under 5MB."
                : null);

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* ── 16:9 container for both drop zone and preview ── */}
            <div className="relative w-full aspect-video overflow-hidden bg-white">
                {!preview ? (
                    /* Drop zone — fills the 16:9 container */
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Upload media. Click or drag a file here."
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => inputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                        className={[
                            "absolute inset-0 flex flex-col items-center justify-center gap-2",
                            "border border-dashed cursor-pointer transition-colors duration-150",
                            isDragging ? "border-ink bg-linen/80" : "border-divider hover:border-accent-muted",
                            errorMessage ? "border-red-400" : "",
                        ].filter(Boolean).join(" ")}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-accent"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-body-sm text-ink-secondary">
                            Tap to upload a photo or video
                        </span>
                        <span className="text-body-sm text-accent-muted">
                            JPG, PNG, WebP · max 5MB &nbsp;·&nbsp; MP4 · max 25MB
                        </span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.mp4"
                            className="sr-only"
                            tabIndex={-1}
                            onChange={handleInputChange}
                            aria-label="Media file input"
                        />
                    </div>
                ) : (
                    /* Preview — fills the 16:9 container with object-cover */
                    <>
                        {fileType === "image" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={preview}
                                alt="Selected media preview"
                                className="absolute inset-0 w-full h-full object-cover object-center"
                            />
                        ) : (
                            <video
                                src={preview}
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover object-center"
                            />
                        )}
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-ink text-linen text-body-sm px-3 py-1.5 opacity-80 hover:opacity-100 transition-opacity"
                            aria-label="Remove selected media"
                        >
                            Remove
                        </button>
                    </>
                )}
            </div>

            {errorMessage && (
                <p role="alert" className="text-body-sm text-red-500">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}

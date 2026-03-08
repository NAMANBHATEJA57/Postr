"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_GIF_TYPES = ["image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
const MAX_GIF_SIZE = 10 * 1024 * 1024;  // 10 MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;  // 25 MB

interface MediaUploadProps {
    onFile: (file: File | null) => void;
    error?: string;
}

type UploadState = "idle" | "invalid-type" | "too-large";
type FileCategory = "image" | "gif" | "video" | null;

export default function MediaUpload({ onFile, error }: MediaUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileCategory, setFileCategory] = useState<FileCategory>(null);
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [isDragging, setIsDragging] = useState(false);

    // Cropping / Adjustment State
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const validateAndSet = useCallback(
        (file: File) => {
            const isImage = ACCEPTED_IMAGE_TYPES.includes(file.type);
            const isGif = ACCEPTED_GIF_TYPES.includes(file.type);
            const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);

            if (!isImage && !isGif && !isVideo) {
                setUploadState("invalid-type");
                return;
            }

            const category: FileCategory = isVideo ? "video" : isGif ? "gif" : "image";
            setFileCategory(category);

            const maxSize = isVideo ? MAX_VIDEO_SIZE : isGif ? MAX_GIF_SIZE : MAX_IMAGE_SIZE;
            if (file.size > maxSize) {
                setUploadState("too-large");
                return;
            }

            setUploadState("idle");
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setOriginalFile(file);
            onFile(file);

            // Reset crop state
            setOffset({ x: 0, y: 0 });
            setScale(1);
            setIsAdjusting(false);
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
        setOriginalFile(null);
        setFileCategory(null);
        setUploadState("idle");
        setIsAdjusting(false);
        onFile(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    // --- Cropping Logic ---

    // Apply crop and generate new blob
    const applyCrop = async () => {
        if (!imgRef.current || !containerRef.current || !originalFile) return;

        const canvas = document.createElement("canvas");
        const container = containerRef.current.getBoundingClientRect();

        // We crop at 2x resolution to maintain quality
        canvas.width = container.width * 2;
        canvas.height = container.height * 2;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = imgRef.current;
        const imgRect = img.getBoundingClientRect();

        // Calculate the ratio of the natural image size to its rendered size
        const ratioX = img.naturalWidth / imgRect.width;
        const ratioY = img.naturalHeight / imgRect.height;

        // Source selection bounds (what part of the original image are we viewing)
        const sx = Math.max(0, (container.left - imgRect.left) * ratioX);
        const sy = Math.max(0, (container.top - imgRect.top) * ratioY);
        const sw = Math.min(img.naturalWidth - sx, container.width * ratioX);
        const sh = Math.min(img.naturalHeight - sy, container.height * ratioY);

        // Destination bounds (where do we draw on canvas)
        const dx = Math.max(0, (imgRect.left - container.left) * 2);
        const dy = Math.max(0, (imgRect.top - container.top) * 2);
        const dw = Math.min(canvas.width - dx, sw / ratioX * 2);
        const dh = Math.min(canvas.height - dy, sh / ratioY * 2);

        // Fill background (in case image is smaller than container)
        ctx.fillStyle = "#FBF7F2";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], originalFile.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                });

                // Update preview with cropped blob
                const newPreview = URL.createObjectURL(croppedFile);
                setPreview(newPreview);
                onFile(croppedFile);
                setIsAdjusting(false);
                setOffset({ x: 0, y: 0 });
                setScale(1);
            }
        }, "image/jpeg", 0.95);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isAdjusting) return;
        setIsPanning(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPanning || !isAdjusting) return;

        // Minimal constraint - allow freely moving it behind the frame
        setOffset({
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y,
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsPanning(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    // Zoom with scroll wheel
    const handleWheel = (e: React.WheelEvent) => {
        if (!isAdjusting) return;
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        setScale(Math.min(Math.max(1, scale + delta), 3));
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const preventScroll = (e: WheelEvent) => {
                if (isAdjusting) e.preventDefault();
            };
            container.addEventListener("wheel", preventScroll, { passive: false });
            return () => container.removeEventListener("wheel", preventScroll);
        }
    }, [isAdjusting]);

    const errorMessage =
        error ??
        (uploadState === "invalid-type"
            ? "Only JPG, PNG, WebP, GIF, or MP4 files are allowed."
            : uploadState === "too-large"
                ? fileCategory === "video"
                    ? "Video must be under 25MB."
                    : fileCategory === "gif"
                        ? "GIF must be under 10MB."
                        : "Image must be under 5MB."
                : null);

    // Determines if we show crop controls
    const canAdjust = fileCategory === "image" && preview !== null;

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* ── 4:3 container for both drop zone and preview ── */}
            <div
                ref={containerRef}
                className={`relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-[#FBF7F2] rounded-xl border ${isAdjusting ? "border-accent shadow-inner ring-4 ring-accent-soft" : "border-divider"}`}
            >
                {!preview ? (
                    /* Drop zone */
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
                            "border-2 border-dashed border-transparent cursor-pointer transition-colors duration-150 rounded-xl",
                            isDragging ? "border-[#C08497] bg-surface" : "hover:bg-black/[0.02]",
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
                            upload a photo or video
                        </span>
                        <span className="text-body-sm text-accent-muted text-center leading-relaxed">
                            photos up to 5MB. videos up to 25MB.
                        </span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.gif,.mp4"
                            className="sr-only"
                            tabIndex={-1}
                            onChange={handleInputChange}
                            aria-label="Media file input"
                        />
                    </div>
                ) : (
                    /* Preview */
                    <div
                        className={`absolute inset-0 w-full h-full flex items-center justify-center ${isAdjusting ? "cursor-grab active:cursor-grabbing touch-none" : ""}`}
                        style={isAdjusting ? { touchAction: "none" } : {}}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onWheel={handleWheel}
                    >
                        {fileCategory === "video" ? (
                            <video
                                src={preview}
                                muted
                                playsInline
                                loop
                                autoPlay
                                preload="metadata"
                                className="w-full h-full object-cover object-center pointer-events-none"
                            />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                ref={imgRef}
                                src={preview}
                                alt="Selected media preview"
                                className={isAdjusting ? "max-w-none pointer-events-none" : "w-full h-full object-cover object-center pointer-events-none"}
                                style={isAdjusting ? {
                                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                                    transformOrigin: '50% 50%',
                                    // Make image big enough to cover viewport initially when adjusting
                                    minWidth: '100%',
                                    minHeight: '100%',
                                } : {}}
                            />
                        )}

                        {/* Overlay grid when adjusting */}
                        {isAdjusting && (
                            <div className="absolute inset-0 pointer-events-none border-[1px] border-white/50 mix-blend-overlay">
                                <div className="absolute inset-0 flex justify-evenly">
                                    <div className="w-px h-full bg-white/40" />
                                    <div className="w-px h-full bg-white/40" />
                                </div>
                                <div className="absolute inset-0 flex flex-col justify-evenly">
                                    <div className="h-px w-full bg-white/40" />
                                    <div className="h-px w-full bg-white/40" />
                                </div>
                            </div>
                        )}

                        {/* Top-right actions (only visible when NOT adjusting) */}
                        {!isAdjusting && (
                            <div className="absolute top-2 right-2 flex gap-2">
                                {canAdjust && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Reset original image preview before adjusting
                                            if (originalFile) setPreview(URL.createObjectURL(originalFile));
                                            setIsAdjusting(true);
                                        }}
                                        className="bg-white/90 backdrop-blur text-ink text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-sm shadow-sm hover:bg-white transition-colors"
                                    >
                                        adjust
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="bg-ink/80 backdrop-blur text-white text-[11px] uppercase tracking-wide px-3 py-1.5 rounded-sm hover:bg-ink transition-colors"
                                    aria-label="Remove selected media"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {/* Adjustment actions (only visible WHEN adjusting) */}
                        {isAdjusting && (
                            <div
                                className="absolute bottom-4 inset-x-0 flex justify-center gap-3"
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOffset({ x: 0, y: 0 });
                                        setScale(1);
                                        setIsAdjusting(false);
                                    }}
                                    className="bg-white/90 backdrop-blur text-ink font-medium text-[11px] uppercase tracking-wide px-4 py-2 rounded-full shadow-md hover:bg-white transition-colors"
                                >
                                    cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={applyCrop}
                                    className="bg-ink text-white font-medium text-[11px] uppercase tracking-wide px-5 py-2 rounded-full shadow-md hover:bg-[#111] transition-colors"
                                >
                                    done
                                </button>
                            </div>
                        )}
                    </div>
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

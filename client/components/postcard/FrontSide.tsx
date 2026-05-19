"use client";

import { useState } from "react";
import Image from "next/image";
import { ApiPostcardResponse } from "@/types/postcard";
import PostcardLoader from "./PostcardLoader";

interface FrontSideProps {
    postcard: ApiPostcardResponse;
}

/** Detect GIF by URL extension so we don't need a separate mediaType enum value */
function isGif(url: string) {
    return /\.gif(\?|$)/i.test(url);
}

/** Surgically optimize Cloudinary media URLs at render time with zero client overhead */
function getOptimizedUrl(url: string): string {
    if (!url || !url.includes("res.cloudinary.com")) return url;
    if (url.includes("f_auto") || url.includes("q_auto")) return url;
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return url;
    return `${url.slice(0, uploadIndex + 8)}f_auto,q_auto/${url.slice(uploadIndex + 8)}`;
}

/**
 * FrontSide — the media face of the postcard.
 * Handles: static images (JPG/PNG/WebP), GIFs (auto-loop img), and MP4 video.
 * Always fills container with object-cover. Shimmer until loaded.
 */
export default function FrontSide({ postcard }: FrontSideProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const shimmer = (
        <div className={`absolute inset-0 transition-opacity duration-200 ease-subtle ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100 z-20"}`}>
            <PostcardLoader />
        </div>
    );

    const mediaClass = `absolute inset-0 w-full h-full object-cover object-center z-10 transition-opacity duration-200 ease-subtle rounded-xl ${isLoaded ? "opacity-100" : "opacity-0"}`;

    return (
        <div className="relative w-full h-full bg-[#FBF7F2] overflow-hidden flex items-center justify-center rounded-xl">
            {postcard.mediaUrl ? (
                <>
                    {shimmer}

                    {postcard.mediaType === "video" ? (
                        <video
                            src={getOptimizedUrl(postcard.mediaUrl)}
                            muted
                            playsInline
                            loop
                            autoPlay
                            preload="metadata"
                            disablePictureInPicture
                            className={mediaClass}
                            aria-label={postcard.title}
                            onLoadedData={() => setIsLoaded(true)}
                        />
                    ) : isGif(postcard.mediaUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={getOptimizedUrl(postcard.mediaUrl)}
                            alt={postcard.title}
                            className={mediaClass}
                            draggable={false}
                            onLoad={() => setIsLoaded(true)}
                        />
                    ) : (
                        <Image
                            src={getOptimizedUrl(postcard.mediaUrl)}
                            alt={postcard.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 640px"
                            className={`object-cover object-center z-10 transition-opacity duration-200 ease-subtle rounded-xl ${isLoaded ? "opacity-100" : "opacity-0"}`}
                            priority
                            draggable={false}
                            onLoad={() => setIsLoaded(true)}
                        />
                    )}
                </>
            ) : null}

            {/* Paper Texture Overlay */}
            <div
                className="absolute inset-0 z-20 pointer-events-none rounded-xl"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    opacity: 0.04,
                    mixBlendMode: 'multiply',
                }}
            />
        </div>
    );
}

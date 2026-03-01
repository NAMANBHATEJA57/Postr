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

    const mediaClass = `absolute inset-0 w-full h-full object-cover object-center z-10 transition-opacity duration-200 ease-subtle ${isLoaded ? "opacity-100" : "opacity-0"}`;

    return (
        <div className="relative w-full h-full bg-white overflow-hidden flex items-center justify-center">
            {shimmer}

            {postcard.mediaType === "video" ? (
                <video
                    src={postcard.mediaUrl}
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
                    src={postcard.mediaUrl}
                    alt={postcard.title}
                    className={mediaClass}
                    draggable={false}
                    onLoad={() => setIsLoaded(true)}
                />
            ) : (
                <Image
                    src={postcard.mediaUrl}
                    alt={postcard.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 640px"
                    className={`object-cover object-center z-10 transition-opacity duration-200 ease-subtle ${isLoaded ? "opacity-100" : "opacity-0"}`}
                    priority
                    draggable={false}
                    onLoad={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
}

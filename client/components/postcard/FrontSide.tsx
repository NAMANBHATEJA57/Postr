"use client";

import { useState } from "react";
import Image from "next/image";
import { ApiPostcardResponse } from "@/types/postcard";
import PostcardLoader from "./PostcardLoader";

interface FrontSideProps {
    postcard: ApiPostcardResponse;
}

/**
 * FrontSide — the image face of the postcard.
 * Always 16:9, object-cover, priority loaded. No text, no overlay.
 */
export default function FrontSide({ postcard }: FrontSideProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            className="relative w-full h-full bg-white overflow-hidden flex items-center justify-center"
        >
            {/* Loading Indicator */}
            <div className={`absolute inset-0 transition-opacity duration-200 ease-subtle ${isLoaded ? "opacity-0 pointer-events-none" : "opacity-100 z-20"}`}>
                <PostcardLoader />
            </div>

            {postcard.mediaType === "image" ? (
                <Image
                    src={postcard.mediaUrl}
                    alt={postcard.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 640px"
                    className={`object-cover object-center z-10 transition-opacity duration-200 ease-subtle ${isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    priority
                    draggable={false}
                    onLoad={() => setIsLoaded(true)}
                />
            ) : (
                <video
                    src={postcard.mediaUrl}
                    muted
                    playsInline
                    loop
                    autoPlay
                    preload="none"
                    className={`absolute inset-0 w-full h-full object-cover object-center z-10 transition-opacity duration-200 ease-subtle ${isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    aria-label={postcard.title}
                    onLoadedData={() => setIsLoaded(true)}
                />
            )}
        </div>
    );
}

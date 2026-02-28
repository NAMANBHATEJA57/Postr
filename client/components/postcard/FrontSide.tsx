import Image from "next/image";
import { ApiPostcardResponse } from "@/types/postcard";

interface FrontSideProps {
    postcard: ApiPostcardResponse;
}

/**
 * FrontSide — the image face of the postcard.
 * Always 16:9, object-cover, priority loaded. No text, no overlay.
 */
export default function FrontSide({ postcard }: FrontSideProps) {
    return (
        <div
            className="relative w-full bg-white overflow-hidden"
            style={{ aspectRatio: "16 / 9" }}
        >
            {postcard.mediaType === "image" ? (
                <Image
                    src={postcard.mediaUrl}
                    alt={postcard.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 640px"
                    className="object-cover object-center"
                    priority
                    draggable={false}
                />
            ) : (
                <video
                    src={postcard.mediaUrl}
                    muted
                    playsInline
                    loop
                    preload="none"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    aria-label={postcard.title}
                />
            )}
        </div>
    );
}

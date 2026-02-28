"use client";

import Image from "next/image";
import { resolveTheme } from "@/themes";
import { ApiPostcardResponse } from "@/types/postcard";

interface PostcardRendererProps {
    postcard: ApiPostcardResponse;
}

export default function PostcardRenderer({ postcard }: PostcardRendererProps) {
    const theme = resolveTheme(postcard.theme);
    const { layout, colors, typography, spacing } = theme;

    const cardStyle: React.CSSProperties = {
        backgroundColor: colors.surface,
        color: colors.text,
        fontFamily: typography.bodyFont,
        padding: layout.type === "full-bleed" ? "0" : spacing.cardPadding,
        border:
            layout.type === "framed" ? `1px solid ${colors.border ?? colors.divider}` : "none",
        position: "relative",
        overflow: "hidden",
    };

    const textAreaStyle: React.CSSProperties = {
        padding: layout.type === "full-bleed" ? spacing.cardPadding : "0",
        backgroundColor:
            layout.type === "full-bleed" ? "rgba(26,26,26,0.72)" : "transparent",
        display: "flex",
        flexDirection: "column",
        gap: spacing.contentGap,
        position: layout.type === "full-bleed" ? "absolute" : "static",
        bottom: layout.type === "full-bleed" ? "0" : undefined,
        left: layout.type === "full-bleed" ? "0" : undefined,
        right: layout.type === "full-bleed" ? "0" : undefined,
    };

    return (
        <div
            style={cardStyle}
            className="w-full max-w-postcard mx-auto animate-fade-in"
            role="article"
            aria-label="Postcard"
        >
            {postcard.mediaType === "image" ? (
                <div
                    style={{
                        marginBottom: layout.type === "full-bleed" ? "0" : spacing.contentGap,
                        padding: spacing.mediaPadding,
                    }}
                    className="relative w-full"
                >
                    <Image
                        src={postcard.mediaUrl}
                        alt={`Image for postcard titled: ${postcard.title}`}
                        width={640}
                        height={400}
                        className="w-full h-auto object-cover"
                        priority
                    />
                </div>
            ) : (
                <div
                    style={{
                        marginBottom: layout.type === "full-bleed" ? "0" : spacing.contentGap,
                    }}
                >
                    <video
                        src={postcard.mediaUrl}
                        muted
                        playsInline
                        loop
                        className="w-full h-auto object-cover"
                        aria-label={`Video for postcard titled: ${postcard.title}`}
                    />
                </div>
            )}

            <div style={textAreaStyle}>
                <div
                    className="flex justify-between"
                    style={{
                        color: colors.textSecondary,
                        fontFamily: typography.bodyFont,
                        fontSize: typography.toFromSize,
                        letterSpacing: "0.04em",
                    }}
                >
                    <span>to {postcard.toName.toLowerCase()}</span>
                    <span>from {postcard.fromName.toLowerCase()}</span>
                </div>

                <hr style={{ borderColor: colors.divider, borderTopWidth: "1px" }} />

                <h1
                    style={{
                        fontFamily: typography.headingFont,
                        fontSize: typography.headingSize,
                        color: colors.text,
                        lineHeight: "1.4",
                        fontWeight: 600,
                    }}
                >
                    {postcard.title}
                </h1>

                <p
                    style={{
                        fontFamily: typography.bodyFont,
                        fontSize: typography.bodySize,
                        color: colors.text,
                        lineHeight: "1.6",
                    }}
                >
                    {postcard.message}
                </p>

                <div
                    style={{ borderTopColor: colors.divider }}
                    className="pt-4 border-t mt-2"
                >
                    <a
                        href="/create"
                        className="text-body-sm hover:underline transition-opacity opacity-50 hover:opacity-70"
                        style={{ color: colors.accent, letterSpacing: "0.04em" }}
                    >
                        create yours
                    </a>
                </div>
            </div>
        </div>
    );
}

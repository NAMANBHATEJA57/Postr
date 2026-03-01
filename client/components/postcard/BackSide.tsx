import { ApiPostcardResponse } from "@/types/postcard";
import { STAMPS, StampId } from "@/components/stamps/StampRegistry";

interface BackSideProps {
    postcard: ApiPostcardResponse;
}

/**
 * BackSide — editorial real-postcard layout.
 *
 * Left 60%: Greeting, handwritten message, Sincerely / name signature
 * Right 40%: Divider, stamp placeholder, recipient block
 */
export default function BackSide({ postcard }: BackSideProps) {
    if (!postcard.stampId) {
        console.debug("BackSide: stampId is undefined or null");
    } else {
        console.debug("BackSide: rendering stampId:", postcard.stampId);
    }

    return (
        <div
            className="w-full h-full bg-white flex relative"
            aria-label="Postcard back"
        >
            {/* ── Left: Message column (60%) ── */}
            <div
                className="flex flex-col justify-between"
                style={{
                    width: "60%",
                    padding: "clamp(1.5rem, 4vw, 2.5rem)",
                    paddingRight: "clamp(1rem, 3vw, 1.75rem)",
                }}
            >
                {/* Title (small, serif, secondary) */}
                <p
                    style={{
                        fontFamily: "var(--font-playfair), Georgia, serif",
                        fontSize: "0.75rem",
                        color: "#C7C0B8",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: "1rem",
                    }}
                >
                    {postcard.title}
                </p>

                {/* Greeting */}
                <p
                    style={{
                        fontFamily: "var(--font-caveat), cursive",
                        fontSize: "clamp(1.125rem, 3.5vw, 1.375rem)",
                        color: "#1A1A1A",
                        lineHeight: 1.5,
                        marginBottom: "0.75rem",
                    }}
                >
                    Dear {postcard.toName},
                </p>

                {/* Message body */}
                <p
                    style={{
                        fontFamily: "var(--font-caveat), cursive",
                        fontSize: "clamp(1.125rem, 3.5vw, 1.375rem)",
                        color: "#1A1A1A",
                        lineHeight: 1.65,
                        flex: 1,
                    }}
                >
                    {postcard.message}
                </p>

                {/* Signature — right-aligned within left column */}
                <div style={{ textAlign: "right", marginTop: "1.5rem" }}>
                    <p
                        style={{
                            fontFamily: "var(--font-caveat), cursive",
                            fontSize: "clamp(1rem, 3vw, 1.25rem)",
                            color: "#555555",
                            lineHeight: 1.4,
                            fontStyle: "italic",
                        }}
                    >
                        Sincerely,
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-caveat), cursive",
                            fontSize: "clamp(1.0625rem, 3vw, 1.3125rem)",
                            color: "#1A1A1A",
                            lineHeight: 1.4,
                        }}
                    >
                        {postcard.fromName}
                    </p>
                </div>
            </div>

            {/* ── Vertical divider ── */}
            <div
                style={{
                    width: "1px",
                    backgroundColor: "#E1DCD7",
                    alignSelf: "stretch",
                    flexShrink: 0,
                    margin: "1.5rem 0",
                }}
                aria-hidden="true"
            />

            {/* ── Right: Postcard meta column (40%) ── */}
            <div
                className="flex flex-col"
                style={{
                    width: "40%",
                    padding: "clamp(1.25rem, 3vw, 2rem)",
                    paddingLeft: "clamp(1rem, 2.5vw, 1.5rem)",
                }}
            >
                {/* Address lines */}
                <div style={{ marginTop: "auto" }}>
                    <p
                        style={{
                            fontFamily: "Inter, system-ui, sans-serif",
                            fontSize: "0.6875rem",
                            color: "#C7C0B8",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            marginBottom: "0.5rem",
                        }}
                    >
                        To
                    </p>
                    <p
                        style={{
                            fontFamily: "var(--font-caveat), cursive",
                            fontSize: "clamp(1.0625rem, 3vw, 1.25rem)",
                            color: "#1A1A1A",
                            lineHeight: 1.4,
                        }}
                    >
                        {postcard.toName}
                    </p>
                </div>
            </div>

            {/* Stamp / Stamp Placeholder — Absolute top-right */}
            <div
                className="absolute flex items-center justify-center -rotate-2 drop-shadow-sm [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain"
                style={{
                    top: "clamp(1rem, 2.5vw, 1.5rem)",
                    right: "clamp(1rem, 2.5vw, 1.5rem)",
                    width: "80px",
                    height: "80px",
                    border: postcard.stampId && postcard.stampId in STAMPS ? "none" : "1px solid #E1DCD7",
                    zIndex: 10,
                }}
                aria-hidden="true"
            >
                {postcard.stampId ? (
                    postcard.stampId in STAMPS ? (
                        // @ts-ignore
                        (() => { const Stamp = STAMPS[postcard.stampId as StampId]; return <Stamp />; })()
                    ) : (
                        (() => { console.warn("BackSide: Received invalid stampId", postcard.stampId); return null; })()
                    )
                ) : null}
            </div>
        </div>
    );
}

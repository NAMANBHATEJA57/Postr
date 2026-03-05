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
            <div className="flex flex-col justify-between w-[60%] p-[clamp(1.5rem,4vw,2.5rem)] pr-[clamp(1rem,3vw,1.75rem)]">
                {/* Title (small, serif, secondary) */}
                <p className="font-serif text-xs text-accent-muted tracking-[0.06em] uppercase mb-4">
                    {postcard.title}
                </p>

                {/* Greeting */}
                <p className="font-handwriting text-[clamp(1.125rem,3.5vw,1.375rem)] text-ink leading-[1.5] mb-3">
                    Dear {postcard.toName},
                </p>

                {/* Message body */}
                <p className="font-handwriting text-[clamp(1.125rem,3.5vw,1.375rem)] text-ink leading-[1.65] flex-1">
                    {postcard.message}
                </p>

                {/* Signature — right-aligned within left column */}
                <div className="text-right mt-6">
                    <p className="font-handwriting text-[clamp(1rem,3vw,1.25rem)] text-[#555] leading-[1.4] italic">
                        Sincerely,
                    </p>
                    <p className="font-handwriting text-[clamp(1.0625rem,3vw,1.3125rem)] text-ink leading-[1.4]">
                        {postcard.fromName}
                    </p>
                </div>
            </div>

            {/* ── Vertical divider ── */}
            <div className="w-px bg-[#E1DCD7] self-stretch shrink-0 my-6" aria-hidden="true" />

            {/* ── Right: Postcard meta column (40%) ── */}
            <div className="flex flex-col w-[40%] p-[clamp(1.25rem,3vw,2rem)] pl-[clamp(1rem,2.5vw,1.5rem)]">
                {/* Address lines */}
                <div className="mt-auto">
                    <p className="font-sans text-[11px] text-accent-muted tracking-[0.06em] uppercase mb-2">
                        To
                    </p>
                    <p className="font-handwriting text-[clamp(1.0625rem,3vw,1.25rem)] text-ink leading-[1.4]">
                        {postcard.toName}
                    </p>
                </div>
            </div>

            {/* Stamp / Stamp Placeholder — Absolute top-right */}
            <div
                className={`absolute flex items-center justify-center -rotate-2 drop-shadow-sm [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain w-[80px] h-[80px] z-10 ${postcard.stampId && postcard.stampId in STAMPS ? "border-none" : "border border-[#E1DCD7]"}`}
                style={{
                    top: "clamp(1rem, 2.5vw, 1.5rem)",
                    right: "clamp(1rem, 2.5vw, 1.5rem)",
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

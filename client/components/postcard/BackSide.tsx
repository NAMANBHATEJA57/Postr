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
            className="w-full h-full flex relative"
            style={{ background: "linear-gradient(to right, #FAF8F5 60%, #F6F4F1 60%)" }}
            aria-label="Postcard back"
        >
            {/* ── Left: Message column (60%) ── */}
            <div className="flex flex-col justify-between w-[60%] p-[clamp(1.5rem,4vw,2.5rem)] pr-[clamp(1rem,3vw,1.75rem)]">
                {/* Title (small, serif, secondary) */}
                <p className="font-serif text-xs text-accent-muted tracking-[0.06em] uppercase mb-4">
                    {postcard.title}
                </p>

                {/* Greeting */}
                <p className="font-handwritten text-[clamp(1.125rem,3.5vw,1.375rem)] text-ink leading-[1.5] mb-3">
                    Dear {postcard.toName},
                </p>

                {/* Message body */}
                <p className="font-handwritten text-[clamp(1.125rem,3.5vw,1.375rem)] text-ink leading-[1.65] flex-1">
                    {postcard.message}
                </p>

                {/* Signature — right-aligned within left column */}
                <div className="text-right mt-6">
                    <p className="font-handwritten text-[clamp(1rem,3vw,1.25rem)] text-[#555] leading-[1.4] italic">
                        Sincerely,
                    </p>
                    <p className="font-handwritten text-[clamp(1.0625rem,3vw,1.3125rem)] text-ink leading-[1.4]">
                        {postcard.fromName}
                    </p>
                </div>
            </div>

            {/* ── Vertical divider ── */}
            <div className="w-px self-stretch shrink-0 my-8 mx-0 border-l border-dashed border-[#D5D0CB] opacity-70 z-10" aria-hidden="true" />

            {/* ── Right: Postcard meta column (40%) ── */}
            <div className="flex flex-col w-[40%] p-[clamp(1.25rem,3vw,2rem)] pl-[clamp(1rem,2.5vw,1.5rem)] relative">

                {/* Subtle Postal Postmark */}
                <div className="absolute right-[clamp(4.5rem,8vw,5.5rem)] top-[clamp(1.25rem,3vw,1.75rem)] w-[72px] h-[72px] rounded-full border border-ink/15 flex flex-col items-center justify-center rotate-[6deg] pointer-events-none select-none z-10 mix-blend-multiply" aria-hidden="true">
                    <div className="w-[64px] h-[64px] rounded-full border-[0.5px] border-ink/10 flex flex-col items-center justify-center">
                        <span className="font-sans text-[7px] text-ink/40 font-medium tracking-widest leading-none mb-1">DEARLY POST</span>
                        <span className="font-sans text-[6px] text-ink/30 tracking-wider leading-none">MAR 2026</span>
                    </div>
                </div>

                {/* Address lines */}
                <div className="mt-auto mb-[15%]">
                    <p className="font-serif text-[11px] text-accent-muted tracking-[0.04em] lowercase mb-1">
                        to
                    </p>
                    <p className="font-serif text-[13px] text-accent-muted tracking-[0.02em] lowercase">
                        {postcard.toName}
                    </p>

                    {/* Subtle Postal Code Boxes */}
                    <div className="flex gap-[5px] mt-6 opacity-[0.15]">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-3.5 h-4 border border-ink rounded-[1px]" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Stamp / Stamp Placeholder — Absolute top-right */}
            <div
                className={`absolute flex items-center justify-center -rotate-2 drop-shadow-sm [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain w-[80px] h-[80px] z-20 ${postcard.stampId && postcard.stampId in STAMPS ? "border-none" : "border border-[#E1DCD7]"}`}
                style={{
                    top: "clamp(1.25rem, 3vw, 1.5rem)",
                    right: "clamp(1.25rem, 3vw, 1.5rem)",
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

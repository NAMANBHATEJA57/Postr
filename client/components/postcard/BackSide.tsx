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
            className="w-full h-full flex relative rounded-xl overflow-hidden shadow-inner"
            style={{ backgroundColor: "#FFFDF9", background: "linear-gradient(to right, #FFFDF9 60%, #FBF7F2 100%)" }}
            aria-label="Postcard back"
        >
            {/* ── Left: Message column (60%) ── */}
            <div className="flex flex-col justify-between w-[60%] p-[clamp(1.5rem,4vw,2.5rem)] pr-[clamp(1rem,3vw,1.75rem)]">
                {/* Title (small, serif, secondary) */}
                <p className="font-serif text-xs text-accent-muted tracking-[0.06em] uppercase mb-4">
                    {postcard.title}
                </p>

                {/* Greeting */}
                <p className="font-handwritten text-[clamp(1.125rem,3.5vw,1.375rem)] text-[#1f1f1f] leading-[1.7] tracking-[0.02em] mb-3">
                    Dear {postcard.toName},
                </p>

                {/* Message body */}
                <p className="font-handwritten text-[clamp(1.125rem,3.5vw,1.375rem)] text-[#1f1f1f] leading-[1.7] tracking-[0.02em] flex-1">
                    {postcard.message}
                </p>

                {/* Signature — right-aligned within left column */}
                <div className="text-right mt-6">
                    <p className="font-handwritten text-[clamp(1rem,3vw,1.25rem)] text-[#555] leading-[1.4] italic">
                        Sincerely,
                    </p>
                    <p className="font-handwritten text-[clamp(1.0625rem,3vw,1.3125rem)] text-[#1f1f1f] leading-[1.4] tracking-[0.02em]">
                        {postcard.fromName}
                    </p>
                </div>
            </div>

            {/* ── Vertical divider ── */}
            <div className="w-px self-stretch shrink-0 my-8 mx-0 border-l border-dashed border-[#D5D0CB] opacity-60 z-10" aria-hidden="true" />

            {/* ── Right: Postcard meta column (40%) ── */}
            <div className="flex flex-col w-[40%] p-[clamp(1.25rem,3vw,2rem)] pl-[clamp(1rem,2.5vw,1.5rem)] relative">

                {/* Subtle Postal Postmark */}
                <div className="absolute right-[clamp(3.5rem,7vw,4.5rem)] top-[clamp(1.75rem,3vw,2.25rem)] w-[76px] h-[76px] rounded-full border border-ink/15 flex flex-col items-center justify-center rotate-[6deg] pointer-events-none select-none z-30 mix-blend-multiply opacity-65" aria-hidden="true">
                    <div className="w-[66px] h-[66px] rounded-full border-[0.5px] border-ink/10 flex flex-col items-center justify-center">
                        <span className="font-sans text-[7px] text-ink/50 font-medium tracking-widest leading-none mb-1">DEARLY POST</span>
                        <span className="font-sans text-[6px] text-ink/40 tracking-wider leading-none">
                            {new Date(postcard.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                        </span>
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
                className={`absolute flex items-center justify-center -rotate-[1deg] [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain w-[80px] h-[80px] z-20 opacity-[0.92] contrast-[1.05] ${postcard.stampId && postcard.stampId in STAMPS ? "border-none" : "border border-[#E1DCD7]"}`}
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

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
            className="w-full h-full flex relative rounded-[2px] overflow-hidden shadow-sm"
            style={{ 
                backgroundColor: "#FFFFFF", 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.028'/%3E%3C/svg%3E")` 
            }}
            aria-label="Postcard back"
        >
            {/* ── Header: @DEARLY centered at very top ── */}
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 -translate-y-1/2">
                <p className="font-serif text-[clamp(6px,1.5vw,9px)] text-ink/70 tracking-[0.2em] uppercase">
                    @DEARLY
                </p>
            </div>

            {/* ── Left: Message column (50%) ── */}
            <div className="flex flex-col w-1/2 h-full justify-between p-[clamp(1.5rem,4vw,2.5rem)] pr-[clamp(1rem,2vw,1.5rem)]">
                <div>
                    {/* Title */}
                    <p className="font-serif text-[clamp(12px,2vw,15px)] text-ink/80 tracking-[0.1em] capitalize mb-[clamp(1.5rem,4vw,2rem)] mt-[clamp(0.5rem,2vw,1rem)] font-medium">
                        {postcard.title}
                    </p>

                    {/* Greeting */}
                    <p className="font-handwritten text-[clamp(1rem,2.5vw,1.35rem)] text-[#4a4a4a] leading-[1.6] tracking-normal mb-3">
                        Dear {postcard.toName},
                    </p>

                    {/* Message body */}
                    <p className="font-handwritten text-[clamp(1rem,2.5vw,1.35rem)] text-[#4a4a4a] leading-[1.7] whitespace-pre-wrap break-words tracking-normal">
                        {postcard.message}
                    </p>
                </div>
            </div>

            {/* ── Vertical divider ── */}
            <div className="w-px self-stretch border-l border-ink/40 z-10" style={{ margin: '8% 0' }} aria-hidden="true" />

            {/* ── Right: Postcard meta column (50%) ── */}
            <div className="flex flex-col w-1/2 h-full p-[clamp(1.5rem,4vw,2.5rem)] pl-[clamp(1rem,2vw,1.5rem)] relative">
                
                {/* Subtle Postal Postmark */}
                <div className="absolute right-[clamp(3.5rem,7vw,5.5rem)] top-[clamp(1.5rem,3vw,2.5rem)] w-[76px] h-[76px] rounded-full border-[1.5px] border-ink/40 flex flex-col items-center justify-center -rotate-[12deg] pointer-events-none select-none z-30 mix-blend-multiply opacity-50" aria-hidden="true">
                    <div className="w-[66px] h-[66px] rounded-full border border-ink/30 flex flex-col items-center justify-center">
                        <span className="font-sans text-[7px] text-ink/60 font-semibold tracking-widest leading-none mb-1">DEARLY</span>
                        <div className="flex flex-col items-center border-y border-ink/30 px-2 py-0.5 my-0.5">
                            <span className="font-sans text-[6px] text-ink/50 tracking-[0.2em] leading-none mb-[1px]">POST</span>
                            <span className="font-sans text-[5px] text-ink/40 tracking-wider leading-none">
                                {new Date(postcard.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4 Empty Address lines & Sender Signature */}
                <div className="mt-auto mb-[8%] w-[85%] self-end">
                    <div className="flex flex-col gap-[clamp(1.25rem,3.5vw,1.75rem)] mb-[clamp(1rem,3vw,2rem)]">
                        <div className="w-full h-px bg-ink/30" />
                        <div className="w-full h-px bg-ink/30" />
                        <div className="w-full h-px bg-ink/30" />
                        <div className="w-full h-px bg-ink/30" />
                    </div>
                    {/* Signature — right-aligned underneath address lines */}
                    <div className="text-right">
                        <p className="font-handwritten text-[clamp(1rem,2.5vw,1.35rem)] text-[#4a4a4a] leading-[1.4] tracking-normal">
                            Sincerely,
                        </p>
                        <p className="font-handwritten text-[clamp(1rem,2.5vw,1.35rem)] text-[#4a4a4a] leading-[1.4] tracking-normal">
                            {postcard.fromName}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stamp / Stamp Placeholder — Absolute top-right */}
            <div
                className={`absolute right-[8%] top-[8%] flex items-center justify-center rotate-[4deg] [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain w-[15%] max-w-[80px] aspect-[4/5] z-20 transition-all ${postcard.stampId && postcard.stampId in STAMPS ? "opacity-[0.95] contrast-[1.05] drop-shadow-sm" : "border-2 border-ink/40 border-dashed rounded-[6px] overflow-hidden"}`}
                aria-hidden="true"
            >
                {postcard.stampId ? (
                    postcard.stampId in STAMPS ? (
                        (() => { const Stamp = STAMPS[postcard.stampId as StampId]; return <Stamp />; })()
                    ) : (
                        (() => { console.warn("BackSide: Received invalid stampId", postcard.stampId); return null; })()
                    )
                ) : null}
            </div>
        </div>
    );
}

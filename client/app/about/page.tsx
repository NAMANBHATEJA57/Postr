import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import PostcardContainer from "@/components/postcard/PostcardContainer";

export default function AboutPage() {
  const namanPostcard = {
    id: "naman-about-postcard",
    mediaUrl: "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260409/Postcard_1_vggrdf.png",
    mediaType: "image" as const,
    title: "a small note",
    message: "Thank you for spending a moment here.\n\nDearly was created as an experiment in slower, softer communication on the internet.\n\nI hope it makes sharing feel a little more intentional.",
    toName: "",
    fromName: "Naman",
    theme: "framed" as const,
    expiryAt: null,
    isPasswordProtected: false,
    stampId: "india",
    createdAt: "2026-05-19T20:47:38.000Z", // Fixed timestamp to eliminate dynamic hydration warnings
    visibility: "public" as const,
    spaceId: null,
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1a1a1a] selection:bg-[#C08497]/20 flex flex-col antialiased">
      
      {/* NAVBAR */}
      <Navbar />

      {/* EDITORIAL COLUMN */}
      {/* pt-[144px] md:pt-[176px] preserves the exact layout spacing of the original relative flow navbar */}
      <main className="flex-1 w-full max-w-[620px] mx-auto px-6 pt-[144px] md:pt-[176px] pb-28 flex flex-col items-center gap-20 md:gap-24 text-center">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center gap-6 md:gap-8 w-full">
          <div className="flex flex-col items-center gap-2">
            <span className="font-serif italic text-[#C08497] text-[18px] md:text-[20px] tracking-wide">about dearly</span>
            <h1 className="font-serif text-[42px] md:text-[56px] font-bold tracking-tight leading-[1.1] text-[#1a1a1a]">
              about dearly
            </h1>
            <p className="font-serif italic text-[20px] md:text-[24px] text-[#706B64] mt-2">
              a quieter way to share moments online.
            </p>
          </div>
          
          <div className="font-serif text-[18px] md:text-[21px] leading-[1.65] text-[#4e4a44] italic space-y-4 pt-4 max-w-[540px]">
            <p className="font-medium text-[#1a1a1a]">
              Dearly began with a simple thought:
            </p>
            <p className="text-[22px] md:text-[26px] font-semibold text-[#C08497] tracking-tight py-2 leading-snug">
              not every moment belongs inside a chat.
            </p>
            <p className="font-sans not-italic text-[15px] md:text-[16px] text-[#605c56] leading-[1.7] pt-2">
              Some things deserve to arrive slowly. To be opened intentionally. To be felt for a second longer.
            </p>
            <p className="font-sans not-italic text-[15px] md:text-[16px] text-[#605c56] leading-[1.7]">
              In a world full of notifications, feeds, and endless scrolling, Dearly was created as a quieter alternative — a small digital space for sharing postcards, memories, thoughts, and little moments that matter.
            </p>
          </div>
        </section>

        {/* SECTION 1 — WHY IT EXISTS */}
        <section className="flex flex-col items-center gap-6 pt-10 border-t border-[#e8e2d9]/85 w-full">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            why it exists
          </h2>
          <div className="font-sans text-[15px] md:text-[16px] leading-[1.75] text-[#4e4a44] max-w-[520px] space-y-4">
            <p>
              Modern communication has become fast, crowded, and disposable.
            </p>
            <div className="italic text-[#706B64] space-y-1 py-2 font-serif text-[17px]">
              <p>Messages pile up.</p>
              <p>Conversations blur together.</p>
              <p>Meaning gets lost in the noise.</p>
            </div>
            <p>
              Dearly tries to slow things down. Instead of continuous, fast chats, it places complete focus on standalone postcards.
            </p>
            <p>
              A postcard can simply exist:
            </p>
            <div className="flex flex-col items-center gap-2 pt-1 font-medium text-[#1a1a1a]">
              <p className="flex items-center gap-2">
                <span className="text-[#C08497]">🌍</span> publicly for the world to discover
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#C08497]">🔒</span> or privately between two people
              </p>
            </div>
            <p className="text-[#605c56] pt-2 italic">
              No pressure to reply instantly. No endless comment threads. Just something meaningful, shared quietly.
            </p>
          </div>
        </section>

        {/* SECTION 2 — PUBLIC & PRIVATE */}
        <section className="flex flex-col items-center gap-6 pt-10 border-t border-[#e8e2d9]/85 w-full">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            public & private
          </h2>
          <div className="flex flex-col gap-10 w-full max-w-[480px]">
            
            {/* PUBLIC ELEMENT */}
            <div className="flex flex-col items-center gap-2.5">
              <h3 className="font-serif text-[18px] md:text-[20px] font-semibold text-[#1a1a1a] flex items-center gap-2 justify-center">
                <span>🌍</span> public postcards
              </h3>
              <p className="font-sans text-[14px] md:text-[15px] leading-[1.65] text-[#4e4a44]">
                A public wall where anyone can leave a moment behind. Thoughts, memories, photos, feelings — shared openly for others to discover and experience.
              </p>
              <div className="font-sans text-[11px] uppercase tracking-widest text-[#9e968b] flex gap-3 font-semibold mt-1">
                <span>No likes</span>
                <span>•</span>
                <span>No comments</span>
                <span>•</span>
                <span>No algorithms</span>
              </div>
            </div>

            {/* PRIVATE ELEMENT */}
            <div className="flex flex-col items-center gap-2.5">
              <h3 className="font-serif text-[18px] md:text-[20px] font-semibold text-[#1a1a1a] flex items-center gap-2 justify-center">
                <span>🔒</span> private spaces
              </h3>
              <p className="font-sans text-[14px] md:text-[15px] leading-[1.65] text-[#4e4a44]">
                A shared space between two people. Create a private space with a simple code or link and exchange postcards slowly, one moment at a time.
              </p>
              <div className="font-sans text-[11px] uppercase tracking-widest text-[#9e968b] flex gap-3 font-semibold mt-1">
                <span>Not messaging</span>
                <span>•</span>
                <span>Not social media</span>
                <span>•</span>
                <span>Just postcards</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 3 — BUILT WITH CARE */}
        <section className="flex flex-col items-center gap-6 pt-10 border-t border-[#e8e2d9]/85 w-full">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            built with care
          </h2>
          <div className="font-sans text-[15px] md:text-[16px] leading-[1.75] text-[#4e4a44] max-w-[520px] space-y-4">
            <p>
              Dearly is designed by <strong>Naman</strong> (Product Designer) and built by <strong>Dev</strong> (Software Engineer) — who both love creating calm, emotional digital experiences that feel more human and intentional.
            </p>
            <p className="text-[#605c56]">
              The project is an exploration of slow communication, emotional interfaces, minimal interaction design, and softer experiences on the internet.
            </p>
          </div>
        </section>

        {/* SECTION 4 — INTERACTIVE POSTCARD CLOSED NOTE */}
        <section className="flex flex-col items-center gap-6 pt-12 border-t border-[#e8e2d9]/85 w-full">
          <div className="flex flex-col items-center gap-1.5 mb-2">
            <span className="font-serif italic text-[#C08497] text-[18px] md:text-[20px]">a small note</span>
            <p className="font-sans text-[13px] text-[#888888] tracking-wider uppercase font-semibold">
              Tap the card below to read the message
            </p>
          </div>

          <div className="w-full max-w-[520px] mx-auto">
            <PostcardContainer postcard={namanPostcard} />
          </div>
        </section>

        {/* SECTION 5 — CREATOR LINKS (SUBTLE) */}
        <section className="flex flex-col items-center gap-6 w-full mt-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
            
            {/* Naman Links */}
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-[11px] text-[#888888] tracking-wider uppercase font-semibold">Naman</span>
              <div className="flex items-center gap-4 font-serif text-[15px] italic text-[#C08497] font-medium">
                <Link
                  href="https://naman-eosin.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#a05c70] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#C08497]/50"
                >
                  Portfolio <span className="font-sans not-italic text-[10px] ml-0.5">→</span>
                </Link>
                <span className="text-[#e8e2d9] font-sans not-italic font-light">|</span>
                <Link
                  href="https://www.linkedin.com/in/namanbhateja0808"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#a05c70] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#C08497]/50"
                >
                  LinkedIn <span className="font-sans not-italic text-[10px] ml-0.5">→</span>
                </Link>
              </div>
            </div>

            {/* Dev Links */}
            <div className="flex flex-col items-center gap-1">
              <span className="font-sans text-[11px] text-[#888888] tracking-wider uppercase font-semibold">Dev</span>
              <div className="flex items-center gap-4 font-serif text-[15px] italic text-[#C08497] font-medium">
                <Link
                  href="https://dev-portfolio-ten-azure.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#a05c70] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#C08497]/50"
                >
                  Portfolio <span className="font-sans not-italic text-[10px] ml-0.5">→</span>
                </Link>
                <span className="text-[#e8e2d9] font-sans not-italic font-light">|</span>
                <Link
                  href="https://www.linkedin.com/in/dev-garg771/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#a05c70] transition-colors underline underline-offset-4 decoration-[1.5px] decoration-[#C08497]/50"
                >
                  LinkedIn <span className="font-sans not-italic text-[10px] ml-0.5">→</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}

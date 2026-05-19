import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "about dearly | a quieter way to share moments",
  description: "Dearly is a quiet digital postcard experience built around slow, intentional sharing.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1a1a1a] selection:bg-[#C08497]/20 flex flex-col antialiased">
      
      {/* NAVBAR */}
      <nav className="w-full flex h-[80px] items-center justify-between px-6 md:px-10 max-w-[1200px] mx-auto z-10">
        <Link href="/" className="flex items-center gap-[12px] group">
          <Image
            src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png"
            alt="Dearly logo"
            width={38}
            height={28}
            className="object-contain transition-transform group-hover:scale-[1.05]"
          />
          <span className="font-serif text-[24px] font-bold text-[#1a1a1a] tracking-tight">Dearly</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/public" className="font-sans text-[14px] text-[#706B64] hover:text-[#1a1a1a] transition-colors font-medium">
            Open garden
          </Link>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-[680px] mx-auto px-6 pt-16 md:pt-24 pb-24 md:pb-32 flex flex-col gap-20 md:gap-28">
        
        {/* HERO SECTION */}
        <section className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-3">
            <span className="font-serif italic text-[#C08497] text-[18px] md:text-[20px] tracking-wide">about dearly</span>
            <h1 className="font-serif text-[38px] md:text-[52px] font-bold tracking-tight leading-[1.1] text-[#1a1a1a]">
              a quieter way to share moments online.
            </h1>
          </div>
          <div className="font-serif text-[18px] md:text-[21px] leading-[1.6] text-[#4e4a44] space-y-4 md:space-y-6">
            <p className="font-medium italic text-[#1a1a1a]">
              Dearly began with a simple thought: not every moment belongs inside a chat.
            </p>
            <p>
              Some things deserve to arrive slowly. <br />
              To be opened intentionally. <br />
              To be felt for a second longer.
            </p>
            <p className="font-sans text-[15px] md:text-[16px] leading-[1.6] text-[#605c56] pt-2">
              In a world full of notifications, feeds, and endless scrolling, Dearly was created as a quieter alternative — a small digital space for sharing postcards, memories, thoughts, and little moments that matter.
            </p>
          </div>
        </section>

        {/* SECTION 1 — WHY IT EXISTS */}
        <section className="flex flex-col gap-6 pt-6 border-t border-[#e8e2d9]">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            why it exists
          </h2>
          <div className="font-sans text-[15px] md:text-[16px] leading-[1.7] text-[#4e4a44] space-y-4">
            <p>
              Modern communication has become fast, crowded, and disposable.
            </p>
            <div className="pl-4 border-l border-[#C08497] italic space-y-1 my-4 text-[#706B64]">
              <p>Messages pile up.</p>
              <p>Conversations blur together.</p>
              <p>Meaning gets lost in the noise.</p>
            </div>
            <p>
              Dearly tries to slow things down. Instead of endless, overlapping conversations, it focuses entirely on standalone moments.
            </p>
            <p>
              A postcard can simply exist:
            </p>
            <ul className="list-none pl-4 space-y-2 mt-2 font-medium text-[#1a1a1a]">
              <li className="flex items-center gap-2">
                <span className="text-[#C08497]">🌍</span> publicly for the world to discover
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#C08497]">🔒</span> or privately between two people
              </li>
            </ul>
            <p className="text-[#605c56] pt-2">
              No pressure to reply instantly. No endless comment threads. Just something meaningful, shared quietly.
            </p>
          </div>
        </section>

        {/* SECTION 2 — PUBLIC & PRIVATE COMPARISON */}
        <section className="flex flex-col gap-8 pt-6 border-t border-[#e8e2d9]">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            public & private
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* PUBLIC COLUMN */}
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-[18px] md:text-[20px] font-semibold text-[#1a1a1a] flex items-center gap-2">
                <span>🌍</span> public postcards
              </h3>
              <p className="font-sans text-[14px] md:text-[15px] leading-[1.6] text-[#4e4a44]">
                A public wall where anyone can leave a moment behind. Thoughts, memories, photos, feelings — shared openly for others to discover and experience.
              </p>
              <div className="font-sans text-[12px] uppercase tracking-wider text-[#9e968b] flex flex-wrap gap-x-3 mt-1 font-semibold">
                <span>No likes</span>
                <span>•</span>
                <span>No comments</span>
                <span>•</span>
                <span>No algorithms</span>
              </div>
            </div>

            {/* PRIVATE COLUMN */}
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-[18px] md:text-[20px] font-semibold text-[#1a1a1a] flex items-center gap-2">
                <span>🔒</span> private spaces
              </h3>
              <p className="font-sans text-[14px] md:text-[15px] leading-[1.6] text-[#4e4a44]">
                A shared space between two people. Create a private space with a simple code or link and exchange postcards slowly, one moment at a time.
              </p>
              <div className="font-sans text-[12px] uppercase tracking-wider text-[#9e968b] flex flex-wrap gap-x-3 mt-1 font-semibold">
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
        <section className="flex flex-col gap-6 pt-6 border-t border-[#e8e2d9]">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            built with care
          </h2>
          <div className="font-sans text-[15px] md:text-[16px] leading-[1.7] text-[#4e4a44] space-y-4">
            <p>
              Dearly is designed and built by <strong>Naman</strong> — a product designer who loves creating calm, emotional digital experiences that feel more human and intentional.
            </p>
            <p>
              The project is a physical and digital exploration of:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#605c56]">
              <li>slow communication models</li>
              <li>emotional and tactile user interfaces</li>
              <li>minimal interaction design paradigms</li>
              <li>softer, quieter experiences on the internet</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4 — CONNECT */}
        <section className="flex flex-col gap-6 pt-6 border-t border-[#e8e2d9]">
          <h2 className="font-serif text-[24px] md:text-[28px] font-bold text-[#1a1a1a] tracking-tight">
            connect
          </h2>
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-sans text-[15px] font-medium">
            <Link
              href="https://naman-eosin.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C08497] hover:text-[#a05c70] transition-colors flex items-center gap-1.5 underline underline-offset-4 decoration-[1px]"
            >
              Portfolio <span className="text-[12px] font-serif">→</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/namanbhateja0808"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C08497] hover:text-[#a05c70] transition-colors flex items-center gap-1.5 underline underline-offset-4 decoration-[1px]"
            >
              LinkedIn <span className="text-[12px] font-serif">→</span>
            </Link>
          </div>
        </section>

        {/* SECTION 5 — A SMALL NOTE */}
        <section className="bg-[#FAF7F2] p-8 md:p-10 rounded-[12px] border border-[#e8e2d9] flex flex-col gap-4 text-center mt-4">
          <span className="font-serif italic text-[#C08497] text-[18px] md:text-[20px]">a small note</span>
          <p className="font-serif italic text-[16px] md:text-[18px] leading-[1.6] text-[#4e4a44] max-w-[480px] mx-auto">
            “Thank you for spending a moment here. <br />
            I hope Dearly feels a little quieter than the rest of the internet.”
          </p>
        </section>

      </main>

    </div>
  );
}

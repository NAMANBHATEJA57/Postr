import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "postr — send it beautifully",
  description: "A simple way to send a moment as a digital postcard.",
};

const steps: { heading: string; body: string; large?: boolean }[] = [
  {
    heading: "write something real.",
    body: "keep it short. add a photo or video if it helps.",
  },
  {
    heading: "share the link.",
    body: "no account required to receive.",
  },
  {
    heading: "start something slow.",
    body: "conversations grow over time.",
    large: true,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center px-6 pt-[12vh] pb-20 bg-linen">
      <div className="w-full max-w-[720px] mx-auto flex flex-col items-center text-center">

        {/* Brand Block */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex flex-col items-center gap-3 motion-safe:animate-fade-in-up">
            <Image
              src="/Logo.png"
              alt="postr logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain drop-shadow-none"
              priority
              draggable={false}
            />
            <span className="font-serif text-ink text-2xl font-semibold tracking-tight">
              postr
            </span>
          </div>
        </div>

        <h1
          className="font-serif text-ink leading-tight motion-safe:animate-fade-in [animation-delay:50ms]"
          style={{ fontSize: "clamp(2.25rem, 6vw, 2.75rem)" }}
        >
          send something that feels personal.
        </h1>

        {/* CTA Blocks */}
        <div className="w-full max-w-[320px] mx-auto flex flex-col items-center mt-14 motion-safe:animate-fade-in [animation-delay:100ms]">

          {/* Primary CTA */}
          <div className="flex flex-col items-center w-full mb-8">
            <Link
              href="/create"
              className="flex w-full items-center justify-center
                bg-[#8e8174] text-white font-sans text-body-sm tracking-ui
                rounded-sm min-h-[48px] px-6 shadow-sm
                hover:bg-[#807468] active:bg-[#72675c]
                transition-colors duration-150"
            >
              Make a postcard
            </Link>
            <p className="font-sans text-xs text-ink-secondary opacity-70 mt-3">
              Send one instantly. No account needed.
            </p>
          </div>

          {/* Divider */}
          <div className="flex w-full items-center justify-center mb-6">
            <span className="text-xs text-neutral-400 font-sans tracking-widest uppercase">
              — or —
            </span>
          </div>

          {/* Secondary section */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-4">
            <Link
              href="/register"
              className="flex w-full sm:w-auto items-center justify-center
                bg-transparent border border-neutral-300 text-ink font-sans text-body-sm tracking-ui
                rounded-sm min-h-[44px] px-6
                hover:bg-black/5 active:bg-black/10
                transition-colors duration-150"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="font-sans text-body-sm tracking-ui text-neutral-500 hover:text-ink hover:underline transition-all duration-150 px-2"
            >
              Log in
            </Link>
          </div>

          {/* Contextual line */}
          <p className="font-sans text-xs text-neutral-500 text-center opacity-80 mt-0">
            Create an account to save your postcards.
          </p>

        </div>

        {/* ── How postr works ── */}
        <div
          className="w-full flex flex-col items-center"
          style={{ maxWidth: "640px", margin: "0 auto", paddingTop: "120px", paddingBottom: "120px" }}
        >
          {/* Section label */}
          <p
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "0.875rem",
              color: "#6B635A",
              letterSpacing: "0.08em",
              opacity: 0.6,
              textTransform: "lowercase",
              marginBottom: "56px",
            }}
          >
            how postr works
          </p>

          {/* Steps */}
          <div className="flex flex-col items-center w-full" style={{ gap: 0 }}>
            {steps.map(({ heading, body, large }, i) => (
              <div key={heading} className="flex flex-col items-center w-full">
                {/* Divider between blocks */}
                {i > 0 && (
                  <div
                    style={{
                      width: "40px",
                      height: "1px",
                      background: "rgba(0,0,0,0.08)",
                      margin: "48px auto",
                    }}
                  />
                )}

                <div className="flex flex-col items-center" style={{ gap: "10px" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: large ? "clamp(1.625rem, 4vw, 1.875rem)" : "clamp(1.375rem, 3.5vw, 1.625rem)",
                      color: "#1A1A1A",
                      lineHeight: 1.35,
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    {heading}
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: "1rem",
                      color: "#6B635A",
                      lineHeight: 1.65,
                      opacity: 0.85,
                      maxWidth: "420px",
                      textAlign: "center",
                    }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}


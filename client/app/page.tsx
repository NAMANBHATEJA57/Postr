import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "postr — send it beautifully",
  description: "A simple way to send a moment as a digital postcard.",
};

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-postcard mx-auto flex flex-col items-center gap-10 text-center">

        {/* Logo */}
        <span className="font-serif text-ink text-2xl font-semibold tracking-tight">
          postr
        </span>

        {/* Headline + Subtext */}
        <div className="flex flex-col items-center gap-5">
          <h1
            className="font-serif text-ink leading-tight"
            style={{ fontSize: "clamp(2.25rem, 7vw, 2.75rem)" }}
          >
            send it beautifully.
          </h1>
          <p
            className="font-sans text-ink-secondary leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 3vw, 1.125rem)",
              maxWidth: "420px",
            }}
          >
            a simple way to send a moment as a digital postcard.
          </p>
        </div>

        {/* Primary CTA */}
        <Link
          href="/create"
          className="inline-flex items-center justify-center
            bg-accent text-white font-sans text-body-sm tracking-ui
            px-8 rounded-sm min-h-[44px]
            hover:bg-[#958879] active:bg-[#877A6E]
            transition-colors duration-150"
          aria-label="Create a postcard"
        >
          Create a postcard
        </Link>

        {/* Footer note */}
        <p className="font-sans text-body-sm text-accent-muted tracking-ui">
          no account required.
        </p>

      </div>
    </main>
  );
}

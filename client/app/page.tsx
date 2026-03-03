import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dearly — write something that matters",
  description: "A slower way to share what matters.",
};

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-20 bg-linen">
      <div className="w-full max-w-[640px] mx-auto flex flex-col items-center text-center">

        {/* Brand Block */}
        <div
          className="flex flex-col items-center mb-12 motion-safe:animate-fade-in-up"
          style={{ gap: "12px" }}
        >
          <Image
            src="/Logo.png"
            alt="Dearly logo"
            width={52}
            height={52}
            className="object-contain"
            priority
            draggable={false}
          />
          <span className="font-serif text-ink tracking-tight" style={{ fontSize: "1.75rem", fontWeight: 600, lineHeight: 1 }}>
            Dearly
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-serif text-ink motion-safe:animate-fade-in"
          style={{
            fontSize: "clamp(1.875rem, 5.5vw, 2.5rem)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            animationDelay: "60ms",
            animationFillMode: "both",
          }}
        >
          write something you hold dearly.
        </h1>

        {/* Subtext */}
        <p
          className="font-sans text-ink-secondary motion-safe:animate-fade-in"
          style={{
            fontSize: "1rem",
            lineHeight: 1.65,
            marginTop: "16px",
            opacity: 0.8,
            animationDelay: "120ms",
            animationFillMode: "both",
          }}
        >
          A slower way to share what matters.
        </p>

        {/* CTA Block */}
        <div
          className="w-full max-w-[320px] mx-auto flex flex-col items-center motion-safe:animate-fade-in"
          style={{
            marginTop: "48px",
            gap: "20px",
            animationDelay: "180ms",
            animationFillMode: "both",
          }}
        >
          {/* Primary CTA */}
          <Link
            href="/create"
            className="flex w-full items-center justify-center
              bg-ink text-linen font-sans text-body-sm tracking-ui
              min-h-[48px] px-6
              hover:opacity-80 active:opacity-70
              transition-opacity duration-150"
          >
            Write a letter
          </Link>

          {/* Secondary CTAs */}
          <div className="flex items-center justify-center gap-5 w-full">
            <Link
              href="/register"
              className="flex items-center justify-center
                border border-divider text-ink font-sans text-body-sm tracking-ui
                min-h-[40px] px-5
                hover:border-accent transition-colors duration-150"
            >
              Sign up
            </Link>
            <Link
              href="/login"
              className="font-sans text-body-sm tracking-ui text-ink-secondary hover:text-ink transition-colors duration-150"
            >
              Log in
            </Link>
          </div>

          {/* Muted hint */}
          <p
            className="font-sans text-center"
            style={{ fontSize: "0.8125rem", color: "#C7C0B8", letterSpacing: "0.01em" }}
          >
            No account required to send one.
          </p>
        </div>

      </div>
    </main>
  );
}

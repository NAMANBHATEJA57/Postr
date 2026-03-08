import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dearly — write something that matters",
  description: "A slower, more intentional way to send a private postcard.",
};

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col w-full">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-5 flex-shrink-0">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-ink tracking-tight text-lg font-semibold no-underline"
        >
          Dearly
        </Link>

        {/* Auth actions */}
        <nav className="flex items-center gap-6">
          {/* Tertiary: Sign in — text only */}
          <Link
            href="/login"
            className="nav-signin font-sans text-ink text-sm no-underline opacity-65 transition-opacity duration-150 ease-in-out"
          >
            Sign in
          </Link>

          {/* Secondary: Create account — outline */}
          <Link
            href="/register"
            className="nav-outline font-sans text-ink text-sm px-5 py-2 border border-ink/25 no-underline bg-transparent transition-all duration-150"
          >
            Create account
          </Link>
        </nav>
      </header>

      {/* ── Main Content (Centered) ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-[600px] mx-auto flex flex-col items-center pb-4">

          {/* Logo mark */}
          <Image
            src="https://res.cloudinary.com/db4cbtzey/image/upload/v1772543945/Logo_z9pkxr.png"
            alt=""
            width={44}
            height={44}
            className="object-contain mb-5 opacity-90"
            priority
            draggable={false}
          />

          {/* 1. Headline */}
          <h1 className="font-serif text-ink landing-hero-title mb-2">
            Write something that matters.
          </h1>

          {/* Subheading */}
          <p className="font-sans landing-hero-subtitle mb-6">
            A slower, more intentional way to send a private postcard.
          </p>

          {/* 2. Primary CTA & 3. Helper Text */}
          <div className="flex flex-col items-center gap-2.5 w-full max-w-[280px]">
            <Link
              href="/create"
              className="btn-primary min-h-[52px] w-full flex items-center justify-center font-sans text-body-lg tracking-ui text-linen"
            >
              Send a postcard
            </Link>

            {/* Combined helper line with reduced opacity */}
            <p className="font-sans text-[13px] text-ink-secondary tracking-[0.01em] opacity-80 leading-snug">
              No account needed. <br className="sm:hidden" />
              Or <Link href="/register" className="underline underline-offset-2 hover:text-ink transition-colors">create an account</Link> to keep conversations.
            </p>
          </div>

          {/* 4. Privacy Reassurance */}
          <div className="mt-8 flex items-center justify-center gap-1.5 opacity-60">
            <span
              className="material-symbols-rounded"
              style={{ fontSize: 15, strokeWidth: 1.5, color: "var(--ink-secondary)" }}
              aria-hidden="true"
            >
              lock
            </span>
            <p className="font-sans text-[12px] text-ink-secondary tracking-[0.01em]">
              your words stay private — every postcard is encrypted.
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dearly ΓÇö write something that matters",
  description: "A slower, more intentional way to send a private postcard.",
};

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col w-full">

      {/* ΓöÇΓöÇ Header ΓöÇΓöÇ */}
      <header className="flex items-center justify-between px-8 py-5">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-ink tracking-tight text-lg font-semibold no-underline"
        >
          Dearly
        </Link>

        {/* Auth actions */}
        <nav className="flex items-center gap-6">
          {/* Tertiary: Sign in ΓÇö text only */}
          <Link
            href="/login"
            className="nav-signin font-sans text-ink text-sm no-underline opacity-65 transition-opacity duration-150 ease-in-out"
          >
            Sign in
          </Link>

          {/* Secondary: Create account ΓÇö outline */}
          <Link
            href="/register"
            className="nav-outline font-sans text-ink text-sm px-5 py-2 border border-ink/25 no-underline bg-transparent transition-all duration-150"
          >
            Create account
          </Link>
        </nav>
      </header>

      {/* ΓöÇΓöÇ Hero ΓöÇΓöÇ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center landing-hero-container">
        <div className="w-full max-w-[600px] mx-auto flex flex-col items-center">

          {/* Logo mark */}
          <Image
            src="https://res.cloudinary.com/db4cbtzey/image/upload/v1772543945/Logo_z9pkxr.png"
            alt=""
            width={44}
            height={44}
            className="object-contain mb-9 opacity-90"
            priority
            draggable={false}
          />

          {/* Headline */}
          <h1 className="font-serif text-ink landing-hero-title">
            Write something that matters.
          </h1>

          {/* Subheading */}
          <p className="font-sans landing-hero-subtitle">
            A slower, more intentional way to send a private postcard.
          </p>

          {/* Primary CTA */}
          <div className="landing-hero-cta">
            <Link
              href="/create"
              className="btn-primary min-h-[52px] w-full"
            >
              Send a postcard
            </Link>

            {/* Supporting text */}
            <p className="font-sans text-[13px] text-accent-muted tracking-[0.01em]">
              No account needed to send your first one.
            </p>

            {/* Optional conversion line */}
            <p className="font-sans text-[13px] text-ink-muted">
              Or{" "}
              <Link
                href="/register"
                className="underline underline-offset-2 text-[#6B635A] hover:text-ink"
              >
                create an account
              </Link>{" "}
              to start lasting conversations.
            </p>
          </div>

        </div>
      </div>

    </main>
  );
}

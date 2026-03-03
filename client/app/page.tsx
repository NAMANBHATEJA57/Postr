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
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="font-serif text-ink tracking-tight"
          style={{ fontSize: "1.125rem", fontWeight: 600, textDecoration: "none" }}
        >
          Dearly
        </Link>

        {/* Auth actions */}
        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Tertiary: Sign in — text only */}
          <Link
            href="/login"
            className="nav-signin font-sans text-ink"
            style={{
              fontSize: "0.875rem",
              textDecoration: "none",
              opacity: 0.65,
              transition: "opacity 150ms ease",
            }}
          >
            Sign in
          </Link>

          {/* Secondary: Create account — outline */}
          <Link
            href="/register"
            className="nav-outline font-sans text-ink"
            style={{
              fontSize: "0.875rem",
              padding: "8px 20px",
              border: "1px solid rgba(26,26,26,0.25)",
              textDecoration: "none",
              transition: "background 150ms ease, border-color 150ms ease",
              background: "transparent",
            }}
          >
            Create account
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 text-center"
        style={{
          paddingBottom: "32px",
          animation: "fadeInUp 600ms ease-out both",
        }}
      >
        <div className="w-full max-w-[600px] mx-auto flex flex-col items-center">

          {/* Logo mark */}
          <Image
            src="https://res.cloudinary.com/db4cbtzey/image/upload/v1772543945/Logo_z9pkxr.png"
            alt=""
            width={44}
            height={44}
            className="object-contain"
            priority
            draggable={false}
            style={{ marginBottom: "36px", opacity: 0.9 }}
          />

          {/* Headline */}
          <h1
            className="font-serif text-ink"
            style={{
              fontSize: "clamp(2rem, 6vw, 2.75rem)",
              lineHeight: 1.25,
              letterSpacing: "-0.015em",
              marginBottom: "20px",
              animation: "fadeInUp 600ms 80ms ease-out both",
            }}
          >
            Write something that matters.
          </h1>

          {/* Subheading */}
          <p
            className="font-sans"
            style={{
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              color: "#6B635A",
              marginBottom: "48px",
              animation: "fadeInUp 600ms 160ms ease-out both",
            }}
          >
            A slower, more intentional way to send a private postcard.
          </p>

          {/* Primary CTA */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "100%",
              maxWidth: "320px",
              animation: "fadeInUp 600ms 240ms ease-out both",
            }}
          >
            <Link
              href="/create"
              className="hover-elevate font-sans"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: "52px",
                background: "#1A1A1A",
                color: "#F8F4EF",
                fontSize: "0.9375rem",
                letterSpacing: "0.02em",
                textDecoration: "none",
                transition: "opacity 150ms ease",
              }}
            >
              Send a postcard
            </Link>

            {/* Supporting text */}
            <p
              className="font-sans"
              style={{ fontSize: "0.8125rem", color: "#C7C0B8", letterSpacing: "0.01em" }}
            >
              No account needed to send your first one.
            </p>

            {/* Optional conversion line */}
            <p
              className="font-sans"
              style={{ fontSize: "0.8125rem", color: "#A9A19A" }}
            >
              Or{" "}
              <Link
                href="/register"
                style={{ color: "#6B635A", textDecoration: "underline", textUnderlineOffset: "2px" }}
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

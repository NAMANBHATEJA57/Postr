import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "postr — send a moment",
  description: "A calm, minimal digital postcard sent via link. Send something intentional.",
};

export default function LandingPage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-postcard mx-auto flex flex-col gap-10">
        {/* Wordmark */}
        <header>
          <span className="font-serif text-ink text-2xl font-semibold tracking-tight">
            postr
          </span>
        </header>

        {/* Hero */}
        <section aria-labelledby="hero-heading">
          <h1
            id="hero-heading"
            className="font-serif text-h1 text-ink leading-tight"
            style={{ maxWidth: "520px" }}
          >
            Send a moment.
          </h1>
          <p className="mt-6 text-body-lg text-ink-secondary" style={{ maxWidth: "400px" }}>
            A quiet digital postcard, delivered as a link. No accounts. No noise.
            Just a moment, composed.
          </p>
        </section>

        {/* CTA */}
        <div>
          <Link
            href="/create"
            className="inline-flex items-center justify-center bg-ink text-linen font-sans text-body-sm tracking-ui px-8 py-4 min-h-[48px] transition-opacity hover:opacity-80"
            aria-label="Create a postcard"
          >
            Create a postcard
          </Link>
        </div>

        {/* Sub-line */}
        <p className="text-body-sm text-accent-muted tracking-ui">
          Private by default &nbsp;·&nbsp; Expires when you choose
        </p>
      </div>

      {/* Footer mark */}
      <footer className="fixed bottom-6 left-0 right-0 text-center">
        <span className="text-body-sm text-accent-muted tracking-ui opacity-60">
          postr
        </span>
      </footer>
    </main>
  );
}

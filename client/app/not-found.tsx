import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col w-full min-h-[calc(100vh-160px)]">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="font-serif text-ink tracking-tight text-lg font-semibold no-underline"
        >
          Dearly
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="nav-signin font-sans text-ink text-sm no-underline opacity-65 transition-opacity duration-150 ease-in-out"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="nav-outline font-sans text-ink text-sm px-5 py-2 border border-ink/25 no-underline bg-transparent transition-all duration-150"
          >
            Create account
          </Link>
        </nav>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-[600px] mx-auto flex flex-col items-center">
          <h1 className="font-serif text-[42px] leading-[1.1] text-ink mb-4 tracking-tight">
            Nothing to see here.
          </h1>
          <p className="font-sans text-[17px] text-ink-muted mb-10 max-w-[400px]">
            This link may be broken, or the postcard may have been moved or removed.
          </p>

          <Link
            href="/"
            className="btn-primary min-h-[52px] w-[260px] mx-auto"
          >
            Return to home
          </Link>
        </div>
      </div>

    </main>
  );
}

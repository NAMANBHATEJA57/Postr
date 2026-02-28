import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-postcard mx-auto flex flex-col gap-4">
        <h1 className="font-serif text-h2 text-ink">Postcard not found.</h1>
        <p className="text-body-sm text-ink-secondary">
          This link may be broken or the postcard may have been removed.
        </p>
        <Link
          href="/"
          className="text-body-sm text-accent hover:underline mt-4 tracking-ui"
        >
          go home
        </Link>
      </div>
    </main>
  );
}

export default function NotFound() {
    return (
        <main className="min-h-dvh flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-postcard mx-auto flex flex-col gap-4">
                <p className="text-body-sm text-ink-secondary tracking-ui">404</p>
                <h1 className="font-serif text-h2 text-ink">
                    This postcard doesn&apos;t exist.
                </h1>
                <p className="text-body-sm text-ink-secondary">
                    The link you followed may be invalid or the postcard may have been removed.
                </p>
                <a
                    href="/create"
                    className="text-body-sm text-accent hover:underline mt-4 tracking-ui"
                >
                    create yours
                </a>
            </div>
        </main>
    );
}

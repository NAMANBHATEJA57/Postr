// Force this route to always be server-rendered dynamically.
// Prevents Next.js/CDN from statically caching the page shell.
export const dynamic = "force-dynamic";

import ViewPageClient from "./ViewPageClient";

interface ViewPageProps {
    params: { id: string };
}

export default function ViewPage({ params }: ViewPageProps) {
    return <ViewPageClient id={params.id} />;
}

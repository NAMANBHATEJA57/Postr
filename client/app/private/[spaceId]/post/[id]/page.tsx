// Force this route to always be server-rendered dynamically.
export const dynamic = "force-dynamic";

import ViewPageClient from "./ViewPageClient";

interface ViewPageProps {
    params: { spaceId: string, id: string };
}

export default function ViewPrivatePage({ params }: ViewPageProps) {
    return <ViewPageClient id={params.id} spaceId={params.spaceId} />;
}

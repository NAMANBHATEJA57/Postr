import ViewPageClient from "./ViewPageClient";

export function generateStaticParams() {
    return [{ id: 'unresolved' }];
}

export const dynamicParams = false;

interface ViewPageProps {
    params: { id: string };
}

export default function ViewPage({ params }: ViewPageProps) {
    return <ViewPageClient id={params.id} />;
}

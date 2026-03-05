import ViewPageClient from "./ViewPageClient";


interface ViewPageProps {
    params: { id: string };
}

export default function ViewPage({ params }: ViewPageProps) {
    return <ViewPageClient id={params.id} />;
}

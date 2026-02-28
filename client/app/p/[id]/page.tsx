import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ViewClient from "./ViewClient";
import { apiUrl } from "@/lib/api";
import { ApiPostcardResponse } from "@/types/postcard";

interface ViewPageProps {
    params: { id: string };
}

async function fetchPostcard(id: string): Promise<{ data: ApiPostcardResponse | null; status: number }> {
    try {
        const url = apiUrl(`/api/postcards/${id}`);
        const res = await fetch(url, { cache: "no-store" });
        if (res.status === 404) return { data: null, status: 404 };
        if (res.status === 410) return { data: null, status: 410 };
        if (res.status === 401) return { data: null, status: 401 };
        if (!res.ok) return { data: null, status: res.status };
        return { data: await res.json(), status: 200 };
    } catch {
        return { data: null, status: 500 };
    }
}

export async function generateMetadata({ params }: ViewPageProps): Promise<Metadata> {
    const { data } = await fetchPostcard(params.id);
    if (!data) return { title: "postr" };
    return {
        title: `${data.title} — postr`,
        description: `A postcard from ${data.fromName} to ${data.toName}.`,
    };
}

export default async function ViewPage({ params }: ViewPageProps) {
    const { id } = params;

    if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
        notFound();
    }

    const { data, status } = await fetchPostcard(id);

    if (status === 404) notFound();

    if (status === 410) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-postcard mx-auto flex flex-col gap-4">
                    <h1 className="font-serif text-h2 text-ink">This postcard has expired.</h1>
                    <p className="text-body-sm text-ink-secondary">
                        The sender set this postcard to expire. It is no longer available.
                    </p>
                    <a href="/create" className="text-body-sm text-accent hover:underline mt-4 tracking-ui">
                        create yours
                    </a>
                </div>
            </main>
        );
    }

    if (status === 500) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-postcard mx-auto flex flex-col gap-4">
                    <h1 className="font-serif text-h2 text-ink">Something went wrong.</h1>
                    <p className="text-body-sm text-ink-secondary">
                        We couldn&apos;t load this postcard. Please try again.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <ViewClient
                postcardId={id}
                initialData={data}
                status={status}
            />
        </main>
    );
}

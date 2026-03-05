"use client";

import { useEffect, useState } from "react";
import ViewClient from "./ViewClient";
import { apiUrl } from "@/lib/api";
import { ApiPostcardResponse } from "@/types/postcard";

export default function ViewPageClient({ id }: { id: string }) {
    const [data, setData] = useState<ApiPostcardResponse | null>(null);
    const [status, setStatus] = useState<number | null>(null);

    useEffect(() => {
        if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
            setStatus(404);
            return;
        }

        async function fetchPostcard() {
            try {
                const url = apiUrl(`/api/postcards/${id}`);
                const res = await fetch(url, { cache: "no-store" });
                // Parse JSON before updating state so both updates happen in
                // the same render — avoids a render where status=200 but data=null.
                const json = res.ok ? await res.json() : null;
                setStatus(res.status);
                if (json) setData(json);
            } catch {
                setStatus(500);
            }
        }
        fetchPostcard();
    }, [id]);

    if (status === null) {
        return (
            <main className="min-h-dvh flex items-center justify-center">
                <span className="text-body-sm text-accent-muted">loading…</span>
            </main>
        );
    }

    if (status === 404) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <h1 className="font-serif text-h2 text-ink">Not found.</h1>
            </main>
        );
    }

    if (status === 410) {
        return (
            <main className="min-h-dvh flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-postcard mx-auto flex flex-col gap-4">
                    <h1 className="font-serif text-h2 text-ink">this postcard has expired.</h1>
                    <p className="text-body-sm text-ink-secondary">
                        guest postcards disappear after 7 days.
                    </p>
                    <a href="/create" className="text-body-sm text-accent hover:underline mt-4 tracking-ui">
                        create your own →
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

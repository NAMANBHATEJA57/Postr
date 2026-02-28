"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiUrl } from "@/lib/api";

interface PasswordGateProps {
    postcardId: string;
    onUnlocked: (accessToken?: string) => void;
}

export default function PasswordGate({ postcardId, onUnlocked }: PasswordGateProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim() || loading) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(apiUrl(`/api/postcards/${postcardId}/unlock`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                onUnlocked(data.accessToken);
                return;
            }

            if (res.status === 429) {
                setError("Too many attempts. Please wait a few minutes.");
            } else if (res.status === 401) {
                setError("Incorrect password. Please try again.");
            } else {
                setError("An error occurred. Please try again.");
            }
        } catch {
            setError("Unable to verify password. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-postcard mx-auto flex flex-col gap-8">
                <div>
                    <p className="font-serif text-h2 text-ink">Enter password.</p>
                    <p className="mt-2 text-body-sm text-ink-secondary">
                        This postcard is private.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                    <Input
                        id="unlock-password"
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter the password"
                        error={error ?? undefined}
                        autoComplete="current-password"
                        autoFocus
                    />
                    <Button type="submit" loading={loading} size="lg" className="w-full">
                        Open
                    </Button>
                </form>
            </div>
        </div>
    );
}

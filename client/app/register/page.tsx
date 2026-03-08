"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { Turnstile } from "@marsidev/react-turnstile";

function RegisterPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const claimPostcardId = searchParams.get("claimPostcardId");
    const { user, setUser } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState("");

    useEffect(() => {
        if (user) {
            router.push("/dashboard");
        }
    }, [user, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) return;

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const res = await fetch(apiUrl("/api/auth/register"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "cf-turnstile-response": turnstileToken
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    ...(claimPostcardId ? { claimPostcardId } : {})
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            setUser(data.user);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <main className="min-h-dvh flex items-center justify-center px-4">
            <div className="w-full max-w-[400px] flex flex-col gap-8">
                <header className="flex flex-col items-center gap-3 text-center">
                    <Image src="https://res.cloudinary.com/db4cbtzey/image/upload/v1772543945/Logo_z9pkxr.png" alt="Dearly logo" width={48} height={48} className="object-contain" />
                    <span className="font-serif text-ink tracking-tight text-xl font-semibold">Dearly</span>
                    <h1 className="font-serif text-h2 text-ink">begin something dear.</h1>
                </header>

                <form onSubmit={handleRegister} className="flex flex-col gap-6">
                    <Input
                        id="name"
                        type="text"
                        label="Name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <Input
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />

                    <div className="flex justify-center my-2">
                        <Turnstile
                            siteKey="1x00000000000000000000AA"
                            onSuccess={(token) => setTurnstileToken(token)}
                            options={{ theme: "light" }}
                        />
                    </div>

                    {error && <p className="text-body-sm text-red-500">{error}</p>}

                    <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                        create account
                    </Button>

                    <p className="text-center text-body-sm text-ink-secondary">
                        already have an account? <a href="/login" className="text-ink hover:underline">sign in</a>
                    </p>
                </form>
            </div>
        </main>
    );
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterPageInner />
        </Suspense>
    );
}

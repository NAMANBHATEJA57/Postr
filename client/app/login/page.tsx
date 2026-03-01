"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch(apiUrl("/api/auth/login"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
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
                <header className="flex flex-col items-center gap-4 text-center">
                    <Image src="/Logo.png" alt="postr logo" width={48} height={48} className="object-contain" />
                    <h1 className="font-serif text-h2 text-ink">welcome back.</h1>
                </header>

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
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
                        autoComplete="current-password"
                    />

                    {error && <p className="text-body-sm text-red-500">{error}</p>}

                    <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                        login
                    </Button>

                    <p className="text-center text-body-sm text-ink-secondary">
                        don't have an account? <a href="/register" className="text-ink hover:underline">register</a>
                    </p>
                </form>
            </div>
        </main>
    );
}

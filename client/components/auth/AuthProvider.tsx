"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiUrl } from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initAuth() {
            try {
                const res = await fetch(apiUrl("/api/auth/me"), {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Auth init failed:", err);
            } finally {
                setLoading(false);
            }
        }
        initAuth();
    }, []);

    const logout = async () => {
        try {
            await fetch(apiUrl("/api/auth/logout"), {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            window.location.href = "/login";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

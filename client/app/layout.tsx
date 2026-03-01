import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "postr — send a moment",
  description: "A calm, minimal digital postcard. Send a moment to someone you care about.",
  keywords: ["postcard", "digital postcard", "send a card", "minimal"],
  openGraph: {
    title: "postr — send a moment",
    description: "A calm, minimal digital postcard.",
    type: "website",
  },
};

import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <body className="bg-linen text-ink font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

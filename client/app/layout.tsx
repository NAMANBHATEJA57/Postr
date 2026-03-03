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
  style: ["normal", "italic"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Dearly — write something that matters",
  description: "A slower, more intentional way to send a private postcard.",
  keywords: ["postcard", "digital postcard", "private correspondence", "minimal", "intentional"],
  openGraph: {
    title: "Dearly — write something that matters",
    description: "A slower, more intentional way to send a private postcard.",
    type: "website",
  },
};

import { AuthProvider } from "@/components/auth/AuthProvider";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,300,0,0"
        />
      </head>
      <body className="bg-linen text-ink font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}

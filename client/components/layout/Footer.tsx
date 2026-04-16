"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const hiddenRoutes = ["/create", "/login", "/register"];
    if (hiddenRoutes.includes(pathname) || pathname.startsWith("/p/")) return null;

    return (
        <footer className="w-full bg-[#F8F4EF] pt-14 md:pt-24 pb-16 md:pb-20 relative overflow-hidden">
            <div className="max-w-[1240px] mx-auto px-10 md:px-12 flex flex-col items-center md:flex-row md:items-start justify-between gap-8 md:gap-0">

                {/* Branding — centered on mobile */}
                <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto">
                    <div className="flex flex-col items-center md:items-start gap-[10px]">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" alt="Logo" width={38} height={28} className="object-cover opacity-90" />
                        <span className="font-serif text-[24px] font-semibold text-[#1a1a1a] tracking-[-0.45px]">Dearly</span>
                        <span className="font-sans text-[16px] text-[#555]/60 tracking-tight">digital postcards for every moment</span>
                    </div>

                    <div className="flex flex-col items-center md:items-start gap-[8px] font-sans text-[16px] text-[#1a1a1a]/80 tracking-tight mt-4 md:mt-2">
                        <p className="italic">
                            Made with care by{" "}
                            <Link href="https://github.com/NAMANBHATEJA57" className="underline hover:text-[#1a1a1a] transition-colors underline-offset-4">NB</Link>
                            {" & "}
                            <Link href="#" className="underline hover:text-[#1a1a1a] transition-colors underline-offset-4">DG</Link>
                        </p>
                        <p className="italic text-[#555]/60">© {new Date().getFullYear()} dearly. all rights reserved.</p>
                    </div>
                </div>

                {/* CTA & Watermark — centered on mobile */}
                <div className="relative flex flex-col items-center md:items-end gap-4 md:mt-2">
                    {/* Decorative Logo Watermark */}
                    <div className="absolute right-0 top-[-20px] w-[200px] md:w-[309px] aspect-square opacity-[0.06] md:opacity-[0.04] pointer-events-none transform translate-x-6 translate-y-[-10%]">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" alt="Watermark" fill className="object-contain" />
                    </div>

                    {/* CTA Button */}
                    <Link href="/create" className="relative z-10 inline-flex h-[52px] items-center justify-center bg-[#1a1a1a] px-[80px] py-[16px] rounded-[8px] hover:bg-[#1a1a1a]/90 transition-all shadow-sm">
                        <span className="font-sans text-[#f8f4ef] text-[15px] tracking-[0.3px] font-normal">Send a postcard</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}

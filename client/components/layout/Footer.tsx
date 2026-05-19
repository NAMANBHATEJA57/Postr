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
            <div className="max-w-[1200px] mx-auto px-10 md:px-[80px] flex flex-col items-center md:flex-row md:items-start justify-between gap-8 md:gap-0">

                {/* Branding — centered on mobile */}
                <div className="flex flex-col items-center md:items-start gap-4 w-full md:w-auto">
                    <div className="flex items-start gap-[12px]">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" alt="Logo" width={38} height={28} className="object-cover opacity-90 mt-[2px]" />
                        <div className="flex flex-col gap-[4px] items-center md:items-start">
                            <span className="font-serif text-[26px] font-bold text-[#1a1a1a] tracking-tight leading-none">Dearly</span>
                            <span className="font-sans text-[15px] text-[#888888] tracking-tight">digital postcards for every moment</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-center gap-[8px] md:gap-[12px] font-sans text-[14px] tracking-tight mt-[32px] md:mt-[40px]">
                        <p className="italic text-[#4a4a4a]">
                            Made with care by{" "}
                            <Link href="https://github.com/NAMANBHATEJA57" className="underline hover:text-[#1a1a1a] transition-colors underline-offset-[3px] decoration-[1px]">NB</Link>
                            {" & "}
                            <Link href="https://dev-portfolio-ten-azure.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1a1a1a] transition-colors underline-offset-[3px] decoration-[1px]">DG</Link>
                        </p>
                        <p className="italic text-[#888888]">© {new Date().getFullYear()} dearly. all rights reserved.</p>
                    </div>
                </div>

                {/* CTA & Links — centered on mobile */}
                <div className="relative flex flex-col items-center md:items-end gap-6 md:mt-2">
                    {/* Decorative Logo Watermark */}
                    <div className="absolute right-0 top-[-20px] w-[200px] md:w-[309px] aspect-square opacity-[0.06] md:opacity-[0.04] pointer-events-none transform translate-x-6 translate-y-[-10%]">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" alt="Watermark" fill className="object-contain" />
                    </div>

                    {/* CTA Button only on landing page */}
                    {pathname === "/" && (
                        <Link href="/create?visibility=public" className="relative z-10 inline-flex h-[52px] items-center justify-center bg-[#1a1a1a] px-[80px] py-[16px] rounded-[8px] hover:bg-[#1a1a1a]/90 transition-all shadow-sm">
                            <span className="font-sans text-[#f8f4ef] text-[15px] tracking-[0.3px] font-normal">Write postcard</span>
                        </Link>
                    )}

                    {/* Footer Links Row */}
                    <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-x-[20px] gap-y-[8px] font-sans text-[13px] text-[#888888] font-medium tracking-tight mt-[8px]">
                        <Link href="/about" className="hover:text-[#1a1a1a] transition-colors">About</Link>
                        <span className="text-[#e1dcd7] hidden xs:inline">•</span>
                        <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors">Privacy</Link>
                        <span className="text-[#e1dcd7] hidden xs:inline">•</span>
                        <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors">Terms</Link>
                        <span className="text-[#e1dcd7] hidden xs:inline">•</span>
                        <Link href="/guidelines" className="hover:text-[#1a1a1a] transition-colors">Guidelines</Link>
                        <span className="text-[#e1dcd7] hidden xs:inline">•</span>
                        <Link href="mailto:hello@dearly.app" className="hover:text-[#1a1a1a] transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

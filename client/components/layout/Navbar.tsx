"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CloudinaryImage from "@/components/ui/CloudinaryImage";

const LOGO = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png";

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const base = "flex items-center justify-center gap-[8px] px-[16px] py-[8px] rounded-[6px] font-sans text-[14px] leading-[20px] transition-all duration-150";
    const isActive = pathname === path;
    if (isActive) {
      return `${base} bg-[rgba(26,26,26,0.04)] text-[#1a1a1a] opacity-100 font-semibold`;
    }
    return `${base} text-[#555] hover:bg-[rgba(26,26,26,0.04)] hover:opacity-100 opacity-75`;
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px] w-full transition-all duration-300"
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        backgroundColor: "rgba(248,244,239,0.45)",
        borderBottom: "1px solid rgba(26,26,26,0.04)",
      }}
    >
      <div className="relative mx-auto flex h-full w-full max-w-[1200px] items-center justify-center px-[16px] md:px-[80px]">
        {/* Logo — absolutely positioned left */}
        <Link href="/" className="absolute left-[16px] md:left-[80px] flex items-center gap-[10px] group">
          <div className="relative h-[28px] w-[38px] opacity-90 shrink-0">
            <CloudinaryImage
              src={LOGO}
              alt="Dearly logo"
              fill
              sizes="38px"
              className="object-contain transition-transform group-hover:scale-[1.05]"
              priority
            />
          </div>
          <span
            className="font-serif text-[24px] font-semibold text-[#1a1a1a] leading-[28px]"
            style={{ letterSpacing: "-0.45px" }}
          >
            Dearly
          </span>
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-[2px]">
          <Link href="/public" className={getLinkClass("/public")}>
            <span className="material-symbols-rounded text-[18px] leading-none">public</span>
            Public Postcards
          </Link>
          <Link href="/private" className={getLinkClass("/private")}>
            <span className="material-symbols-rounded text-[18px] leading-none">mail_outline</span>
            Private Postcards
          </Link>
          <Link href="/about" className={getLinkClass("/about")}>
            <span className="material-symbols-rounded text-[18px] leading-none">eco</span>
            About
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="absolute right-[16px] md:hidden flex items-center justify-center w-[24px] h-[24px]"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-rounded text-[24px] text-[#1a1a1a] opacity-70">menu</span>
        </button>
      </div>
    </header>
  );
}

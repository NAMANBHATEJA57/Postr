"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── Asset URLs (CSV + Cloudinary) ─────────────────────────── */
const LOGO = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png";
const HERO_BG = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260680/Hero_vmnesf.png";
const SCENE_1 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259783/Scene_Container_1_sxpd8a.png";
const SCENE_2 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259784/Scene_Container_3_q6d0uu.png";
const SCENE_3 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259783/Scene_Container_2_gmhdfi.png";
const POSTCARD_FRONT = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260409/Postcard_1_vggrdf.png";
const POSTCARD_BACK = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259785/postcard_2_s1tila.png";
const STAMP_1 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259784/Basic_stamp_ow9rf4.png";
const STAMP_2 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259783/Basic_stamp-1_foeywo.png";
const STAMP_3 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259782/Basic_stamp-2_pzfxwl.png";
const STAMP_4 = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259782/Basic_stamp-3_pspbqu.png";

/* ─── Data ───────────────────────────────────────────────────── */
const CARDS = [
  {
    icon: "🌍",
    title: "public postcards",
    body: "share a moment with the world, write something, post it publicly, and let others discover it.",
    img: SCENE_1,
  },
  {
    icon: "🔒",
    title: "private postcards",
    body: "send something just between you two, create a private space and exchange postcards without the noise of chat.",
    img: SCENE_2,
  },
  {
    icon: "💌",
    title: "simple & intentional",
    body: "no accounts, no feeds, no pressure\njust create, share, and let the moment exist.",
    img: SCENE_3,
  },
];

const FAQ = [
  {
    q: "Are my postcards private?",
    a: "yes. your postcard is only accessible through a private link that you choose to share. if you add a password, only someone with the password can open it.",
  },
  {
    q: "How do I send a postcard?",
    a: "Write a postcard, add a memory, choose whether it belongs in public or private, and send the share link or channel code.",
  },
  {
    q: "Can I collect postcards?",
    a: "Yes. Public and private postcards both live as individual moments you can revisit through their links or channels.",
  },
  {
    q: "Can I edit after sending?",
    a: "No. Once a postcard is sent, it stays as it was written, which helps it feel more intentional and real.",
  },
];

/* ─── Shared button components ───────────────────────────────── */
function BtnPrimary({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[48px] w-[280px] items-center justify-center rounded-[8px] bg-[#1a1a1a] font-sans text-[15px] tracking-[0.3px] text-[#f8f4ef] shrink-0 transition-all duration-200 hover:bg-[#2a2a2a] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-none"
    >
      {children}
    </Link>
  );
}

function BtnOutline({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[48px] w-[280px] items-center justify-center rounded-[8px] border border-[#1a1a1a] bg-[rgba(255,255,255,0.4)] font-sans text-[15px] tracking-[0.3px] text-[#1a1a1a] shrink-0 transition-all duration-200 hover:bg-[rgba(255,255,255,0.7)] hover:border-[rgba(26,26,26,0.7)] hover:-translate-y-[1px] active:translate-y-0"
    >
      {children}
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <main className="bg-[#f8f4ef] text-[#1a1a1a] overflow-x-hidden">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header
        className="fixed top-0 z-50 h-[72px] w-full transition-all duration-300"
        style={{
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          backgroundColor: "rgba(248,244,239,0.45)",
          borderBottom: "1px solid rgba(26,26,26,0.04)",
        }}
      >
        <div className="relative mx-auto flex h-full w-full max-w-[1200px] items-center justify-center px-[16px] md:px-[80px]">

          {/* Logo — absolutely positioned left */}
          <Link href="/" className="absolute left-[16px] md:left-[80px] flex items-center gap-[10px]">
            <div className="relative h-[28px] w-[38px] opacity-90 shrink-0">
              <Image src={LOGO} alt="Dearly logo" fill className="object-contain" />
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
            <Link
              href="/public"
              className="flex items-center justify-center gap-[8px] px-[16px] py-[8px] rounded-[6px] font-sans text-[14px] leading-[20px] text-[#555] transition-all duration-150 hover:bg-[rgba(26,26,26,0.04)] hover:opacity-100 opacity-75"
            >
              <span className="material-symbols-rounded text-[18px] leading-none">public</span>
              Public Postcards
            </Link>
            <Link
              href="/private"
              className="flex items-center justify-center gap-[8px] px-[16px] py-[8px] rounded-[6px] font-sans text-[14px] leading-[20px] text-[#555] transition-all duration-150 hover:bg-[rgba(26,26,26,0.04)] hover:opacity-100 opacity-75"
            >
              <span className="material-symbols-rounded text-[18px] leading-none">mail_outline</span>
              Private Postcards
            </Link>
            <a
              href="#about"
              className="flex items-center justify-center gap-[8px] px-[16px] py-[8px] rounded-[6px] font-sans text-[14px] leading-[20px] text-[#555] transition-all duration-150 hover:bg-[rgba(26,26,26,0.04)] hover:opacity-100 opacity-75"
            >
              <span className="material-symbols-rounded text-[18px] leading-none">eco</span>
              About
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button className="absolute right-[16px] md:hidden flex items-center justify-center w-[24px] h-[24px]">
            <span className="material-symbols-rounded text-[24px] text-[#1a1a1a] opacity-70">menu</span>
          </button>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        {/* Background landscape */}
        <div className="absolute inset-0 h-[800px] w-full pointer-events-none">
          <Image src={HERO_BG} alt="" fill className="object-cover object-top" priority />
          {/* Smooth atmospheric bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[300px]"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(248,244,239,0.1) 20%, rgba(248,244,239,0.5) 50%, rgba(248,244,239,0.9) 80%, #f8f4ef 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-[782px] w-full max-w-[1200px] flex-col items-center justify-center px-[16px] pt-[72px] md:px-[80px]">
          <div className="flex flex-col items-center gap-[32px] text-center">

            {/* Header text */}
            <div className="flex flex-col items-center gap-[8px]" style={{ letterSpacing: "-0.45px" }}>
              <h1
                className="font-serif font-semibold text-[#1a1a1a] text-[48px] md:text-[64px] leading-normal text-center max-w-[638px]"
              >
                send digital postcards for every moment
              </h1>
              <p className="font-sans font-medium text-[16px] md:text-[20px] leading-normal text-[#1a1a1a]">
                A calm, minimal way to share something that matters.<br />
                Create a digital postcard and send it as a simple link.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row items-center gap-[8px]">
              <BtnPrimary href="/public">Explore public postcards</BtnPrimary>
              <BtnOutline href="/private">Make Private Space</BtnOutline>
            </div>

            {/* Info */}
            <p
              className="font-sans font-normal text-[13px] text-[#555] opacity-80 text-center"
              style={{ letterSpacing: "0.13px", lineHeight: "17.88px" }}
            >
              No accounts. No noise. Just a moment.
            </p>
          </div>
        </div>
      </section>

      {/* No hard spacer needed — gradient handles the blend */}
      <div className="h-[40px]" />

      {/* ═══════════════ WHAT IS DEARLY ═══════════════ */}
      <section id="about" className="mx-auto w-full max-w-[1200px] px-[16px] md:px-[80px]">
        <div className="flex flex-col items-center gap-[88px]">

          <div className="flex flex-col items-center gap-[10px] text-[#1a1a1a] w-full">
            <p className="font-sans font-semibold text-[24px] leading-normal whitespace-nowrap">
              what is dearly
            </p>
            <div className="font-serif font-normal text-[24px] md:text-[40px] text-center w-full">
              <p className="leading-[2] mb-0">
                dearly is a simple way to send digital postcards and keep them as memories.
              </p>
              <p className="leading-[2]">
                create something personal, share it with someone, and build a collection of moments that matter.
              </p>
            </div>
          </div>

          {/* ═══════════════ FEATURE CARDS ═══════════════ */}
          <div className="flex flex-col md:flex-row gap-[24px] items-stretch w-full">
            {CARDS.map((card) => (
              <article
                key={card.title}
                className="flex flex-col gap-[27px] items-center justify-center bg-white px-[16px] py-[24px] md:flex-1"
                style={{ boxShadow: "5px 0px 15.5px rgba(0,0,0,0.07)" }}
              >
                {/* Scene image */}
                <div className="relative w-full overflow-clip shrink-0"
                  style={{ aspectRatio: "378/344" }}
                >
                  <Image src={card.img} alt={card.title} fill className="object-cover" />
                </div>
                {/* Text */}
                <div className="flex flex-col gap-[12px] w-full">
                  <p className="font-serif font-normal text-[24px] leading-normal text-[#1a1a1a]">
                    {card.icon} {card.title}
                  </p>
                  <div className="font-sans font-medium text-[17px] text-[#555] opacity-50 w-full">
                    {card.body.split("\n").map((line, i) => (
                      <p key={i} className="leading-normal">{line}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ A DIFFERENT WAY TO SHARE ═══════════════ */}
      <section className="mx-auto mt-[88px] w-full max-w-[1200px] px-[16px] md:px-[80px]">
        <div className="flex flex-col gap-[32px] items-center justify-center w-full">

          {/* Text */}
          <div className="flex flex-col gap-[10px] items-center text-[#1a1a1a] text-center w-full">
            <h2
              className="font-serif font-bold text-[40px] leading-normal lowercase min-w-full text-center"
            >
              a different way to share
            </h2>
            <div className="font-sans font-normal text-[16px] md:text-[24px] text-[#1a1a1a]">
              <p className="leading-[1.5] mb-0">most communication today is fast, constant, and easy to ignore.</p>
              <p className="leading-[1.5]">messages pile up, conversations blur, and moments get lost.</p>
            </div>
          </div>

          {/* Postcard artwork — desktop overlapping layout */}
          <div className="hidden md:flex w-full justify-center group mt-[80px]" style={{ perspective: "1000px" }}>
            <div className="relative w-[832px] h-[544px]">
              
              {/* Postcard back (White) — initially right, +13deg, behind */}
              <div
                className="absolute overflow-hidden rounded-[23px] border border-[#eadfd5] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-center left-[287px] top-[29px] rotate-[13deg] z-10 group-hover:left-[0px] group-hover:top-[0px] group-hover:-rotate-[16deg] group-hover:z-30"
                style={{
                  width: "545px",
                  height: "387px",
                  boxShadow: "0 16px 38px rgba(86,63,47,0.08)",
                }}
              >
                <Image src={POSTCARD_BACK} alt="Postcard back" fill className="object-cover" />
              </div>

              {/* Postcard front (Landscape) — initially left, -16deg, in front */}
              <div
                className="absolute overflow-hidden rounded-[23px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] origin-center left-[0px] top-[0px] -rotate-[16deg] z-20 group-hover:left-[287px] group-hover:top-[29px] group-hover:rotate-[13deg] group-hover:z-10"
                style={{
                  width: "562px",
                  height: "399px",
                  boxShadow: "0 16px 38px rgba(86,63,47,0.16)",
                }}
              >
                <Image src={POSTCARD_FRONT} alt="Postcard front" fill className="object-cover" />
              </div>
              
            </div>
          </div>

          {/* Postcard artwork — mobile stacked */}
          <div className="flex flex-col gap-[16px] w-full md:hidden">
            <div className="relative w-full aspect-[545/387] overflow-hidden rounded-[16px]"
              style={{ boxShadow: "0 16px 38px rgba(86,63,47,0.16)" }}>
              <Image src={POSTCARD_FRONT} alt="Postcard front" fill className="object-cover" />
            </div>
            <div className="relative w-full aspect-[545/387] overflow-hidden rounded-[16px]"
              style={{ boxShadow: "0 16px 38px rgba(86,63,47,0.08)" }}>
              <Image src={POSTCARD_BACK} alt="Postcard back" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section className="mt-[88px] w-full px-[16px] md:px-[80px]">
        <div className="relative mx-auto flex h-[400px] w-full max-w-[1200px] items-center overflow-hidden bg-white">
          {/* Stamps — desktop only */}
          <div className="hidden md:block">
            {/* Yellow (Japan) — top left */}
            <div className="absolute left-0 top-0 h-[200px] w-[158px]">
              <Image src={STAMP_2} alt="Japan Stamp" fill className="object-contain" />
            </div>
            {/* Blue (UAE) — bottom left */}
            <div className="absolute left-0 bottom-0 h-[200px] w-[158px]">
              <Image src={STAMP_3} alt="UAE Stamp" fill className="object-contain" />
            </div>
            {/* Green (Rome) — top right */}
            <div className="absolute right-0 top-0 h-[200px] w-[158px]">
              <Image src={STAMP_4} alt="Rome Stamp" fill className="object-contain" />
            </div>
            {/* Orange (India) — bottom right */}
            <div className="absolute right-0 bottom-0 h-[200px] w-[158px]">
              <Image src={STAMP_1} alt="India Stamp" fill className="object-contain" />
            </div>
          </div>

          {/* Content */}
          <div className="relative mx-auto flex w-full flex-col items-center justify-center gap-[32px] px-[16px]">
            <div className="flex flex-col gap-[8px] items-center text-center" style={{ letterSpacing: "-0.45px" }}>
              <h2
                className="font-serif font-semibold text-[48px] md:text-[64px] leading-normal text-[#1a1a1a] max-w-[638px]"
              >
                start your first postcard
              </h2>
              <p className="font-sans font-medium text-[16px] md:text-[20px] leading-normal text-[#1a1a1a]">
                it takes less than a minute
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-[8px]">
              <BtnPrimary href="/public">Explore public postcards</BtnPrimary>
              <BtnOutline href="/private">Make Private Space</BtnOutline>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FAQ ═══════════════ */}
      <section className="mx-auto mt-[88px] w-full max-w-[1200px] px-[16px] pb-[56px] md:px-[80px]">
        <div className="flex flex-col gap-[40px] items-center w-full">

          <h2 className="font-serif font-bold text-[32px] md:text-[40px] text-[#1a1a1a] text-center leading-normal w-full">
            frequently asked questions
          </h2>

          <div className="flex flex-col gap-[16px] w-full max-w-[900px]">
            {FAQ.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <div key={item.q} className="bg-white w-full rounded-[4px]">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between px-[24px] md:px-[32px] py-[24px] gap-[16px] text-left"
                  >
                    <span
                      className="font-sans font-medium text-[16px] md:text-[18px] text-[#1a1a1a]"
                    >
                      {item.q}
                    </span>
                    <span className="material-symbols-rounded text-[#1a1a1a] text-[24px]">
                      {isOpen ? "close" : "add"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-[24px] md:px-[32px] pb-[24px]">
                      <p className="font-sans font-normal text-[14px] md:text-[15px] text-[#333333] leading-[1.6]">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

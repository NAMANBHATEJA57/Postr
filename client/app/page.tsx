"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

// FAQs
const faqs = [
    {
        q: "are my postcards private?",
        a: "yes. your postcard is only accessible through a private link that you choose to share. if you add a password, only someone with it can open it."
    },
    {
        q: "how do I send a postcard?",
        a: "create your postcard, add your message and memory, and click send. you'll get a private link to share."
    },
    {
        q: "can I collect postcards?",
        a: "yes. you can save the postcards you send or upload your own to build a personal collection."
    },
    {
        q: "can I edit after sending?",
        a: "once a postcard is sent, it can't be edited. it keeps each message real and unchanged."
    }
];

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <main className="relative flex-1 flex flex-col w-full min-h-dvh overflow-clip selection:bg-accent/20">
            {/* Page Base Background */}
            <div className="absolute inset-0 w-full h-full bg-[#F8F4EF] -z-20 pointer-events-none" />

            {/* SVG Background for Hero */}
            <div className="absolute top-0 left-0 w-full h-[782px] pointer-events-none -z-10">
                <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259785/Hero_kwxtie.png" alt="Landscape" fill priority className="object-cover object-top" />
                <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#F8F4EF] to-transparent" />
            </div>

            {/* ── HEADER ── */}
            <header className="sticky top-0 w-full h-[72px] flex items-center justify-between px-4 md:px-[80px] z-50 backdrop-blur-[11px] bg-[#f8f4ef]/70 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
                <Link href="/" className="font-serif text-[#1a1a1a] tracking-tight text-[24px] font-semibold no-underline opacity-90 transition-opacity hover:opacity-100 flex items-center gap-[10px]">
                    <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776260207/Logo_kaarkv.png" alt="Logo" width={38} height={28} className="object-cover" />
                    Dearly
                </Link>
                <nav className="flex items-center gap-[8px]">
                    <Link href="/login" className="font-sans text-[#1a1a1a]/80 text-[14px] hover:text-[#1a1a1a] transition-colors duration-200 flex items-center justify-center w-[44px] h-[20px]">Sign in</Link>
                    <Link href="/register" className="font-sans text-[#1a1a1a]/80 text-[14px] border border-[#1a1a1a]/25 px-[14px] py-[12px] rounded-[8px] hover:border-[#1a1a1a]/50 bg-transparent transition-colors duration-200 flex items-center justify-center">
                        Create account
                    </Link>
                </nav>
            </header>

            {/* ── 1. HERO SECTION ── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full px-4 md:px-6 min-h-[702px] flex flex-col items-center justify-center text-center"
            >
                <div className="max-w-[700px] flex flex-col items-center mt-[-60px] w-full">
                    <h1 className="font-serif text-[clamp(2.75rem,5.5vw,4.5rem)] md:text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.05] md:leading-[0.95] text-[#1a1a1a] mb-[22px] tracking-[-0.03em]">
                        send digital postcards<br className="md:hidden" /> for every moment
                        <span className="hidden md:inline"><br />keep it forever.</span>
                    </h1>
                    <p className="font-sans text-[1rem] md:text-[1.25rem] text-[#1a1a1a]/80 leading-relaxed mb-8 md:mb-10 font-medium">
                        create, send, and collect digital postcards that stay with you
                    </p>

                    {/* Mobile: full-width button; Desktop: fixed-width */}
                    <div className="flex flex-col items-center gap-[8px] w-full md:w-auto">
                        <Link href="/create" className="w-full md:w-auto inline-flex h-[52px] items-center justify-center bg-[#1a1a1a] px-[80px] py-[16px] rounded-[8px] hover:bg-[#1a1a1a]/90 transition-all shadow-sm">
                            <span className="font-sans text-[#f8f4ef] text-[15px] tracking-[0.3px] font-normal">Send a postcard</span>
                        </Link>

                        <Link href="/explore" className="font-sans text-[#555]/80 text-[12px] tracking-[0.12px] underline mt-1 hover:text-[#1a1a1a] transition-colors">
                            Explore postcards
                        </Link>
                    </div>

                    <div className="mt-[20px] flex flex-col items-center gap-1 font-sans text-[#555]/80 text-[13px]">
                        <p>No account needed. Or <Link href="/register" className="underline underline-offset-2 hover:text-[#1a1a1a]">create an account</Link> to keep conversations.</p>
                        <p className="opacity-75 text-[12px]">your words stay private — every postcard is encrypted.</p>
                    </div>
                </div>
            </motion.section>

            {/* ── 2. "WHAT IS DEARLY" SECTION ── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full px-6 py-4 mb-[56px] md:mb-[80px] mt-[88px] md:mt-[112px] flex flex-col items-center text-center"
            >
                <div className="max-w-[800px] flex flex-col items-center gap-[10px] md:gap-[32px]">
                    <h3 className="font-sans font-semibold text-[16px] md:text-[18px] tracking-tight text-[#1a1a1a]">what is dearly</h3>
                    <div className="flex flex-col gap-0 md:gap-[40px] relative">
                        <p className="font-serif text-[24px] md:text-[40px] text-[#1a1a1a] leading-[2] md:leading-[1.4] tracking-tight">
                            dearly is a simple way to send digital postcards and keep them as memories.
                        </p>
                        <p className="font-serif text-[24px] md:text-[40px] text-[#1a1a1a] leading-[2] md:leading-[1.4] tracking-tight">
                            create something personal, share it with someone, and build a collection of moments that matter.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* ── 3. 3-STEP CARDS NARRATIVE ── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full md:px-12 md:max-w-[1240px] md:mx-auto pb-20 md:pb-32"
            >
                <div className="flex flex-col md:grid md:grid-cols-3 gap-0 md:gap-[32px] px-0 md:px-0">

                    {/* Card 1 */}
                    <div className="bg-white flex flex-col items-start shadow-[5px_0px_31px_0px_rgba(0,0,0,0.07)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-[#E1DCD7]/40 md:rounded-lg px-[16px] py-[24px] md:p-[16px] md:pb-[32px] transition-transform duration-300 md:hover:-translate-y-1">
                        <div className="w-full h-[296px] md:h-[300px] relative mb-[27px] md:mb-[24px] overflow-hidden">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259783/Scene_Container_1_sxpd8a.png" alt="Scene 1" fill className="object-cover" />
                        </div>
                        <h3 className="font-serif text-[24px] text-[#1a1a1a] mb-[12px] px-0 md:px-2">create a postcard</h3>
                        <p className="font-sans text-[14px] md:text-[14px] leading-[1.5] font-medium opacity-50 text-[#555] px-0 md:px-2 text-left">
                            add a photo, write something simple, make it yours
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white flex flex-col items-start shadow-[5px_0px_31px_0px_rgba(0,0,0,0.07)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-[#E1DCD7]/40 md:rounded-lg px-[16px] py-[24px] md:p-[16px] md:pb-[32px] transition-transform duration-300 md:hover:-translate-y-1">
                        <div className="w-full h-[296px] md:h-[300px] relative mb-[27px] md:mb-[24px] overflow-hidden">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259784/Scene_Container_3_q6d0uu.png" alt="Scene 2" fill className="object-cover" />
                        </div>
                        <h3 className="font-serif text-[24px] text-[#1a1a1a] mb-[12px] px-0 md:px-2">make it personal</h3>
                        <p className="font-sans text-[14px] leading-[1.5] font-medium opacity-50 text-[#555] px-0 md:px-2 text-left">
                            say what you feel, not just what you want to send
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white flex flex-col items-start shadow-[5px_0px_31px_0px_rgba(0,0,0,0.07)] md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-[#E1DCD7]/40 md:rounded-lg px-[16px] py-[24px] md:p-[16px] md:pb-[32px] transition-transform duration-300 md:hover:-translate-y-1">
                        <div className="w-full h-[296px] md:h-[300px] relative mb-[27px] md:mb-[24px] overflow-hidden">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259783/Scene_Container_2_gmhdfi.png" alt="Scene 3" fill className="object-cover" />
                        </div>
                        <h3 className="font-serif text-[24px] text-[#1a1a1a] mb-[12px] px-0 md:px-2">send &amp; collect</h3>
                        <p className="font-sans text-[14px] leading-[1.5] font-medium opacity-50 text-[#555] px-0 md:px-2 text-left">
                            share it or keep it as part of your collection
                        </p>
                    </div>

                </div>
            </motion.section>

            {/* ── 4. COLLECTION SECTION ── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full px-0 md:px-6 py-6 mb-16 md:mb-24 flex flex-col items-center text-center"
            >
                <div className="w-full max-w-[800px] flex flex-col items-center mb-8 md:mb-16 gap-[10px] md:gap-[8px] px-4 md:px-0">
                    <h2 className="font-serif font-bold text-[2.2rem] md:text-[2.25rem] text-[#1a1a1a] tracking-tight leading-normal w-full">
                        build your own collection
                    </h2>
                    <p className="font-sans text-[1rem] md:text-[1.5rem] font-normal text-[#1a1a1a]/80 leading-[1.5] max-w-[600px] tracking-tight">
                        save the postcards you send or upload your own.<br />keep everything in one place.
                    </p>
                </div>

                {/* Mobile: stacked images; Desktop: tactile overlapping postcards */}
                <div className="md:hidden w-full flex flex-col gap-[24px]">
                    <div className="w-full h-[254px] relative overflow-hidden">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259787/Postcard_1_vggrdf.png" alt="Beach Scene Postcard" fill className="object-cover" />
                    </div>
                    <div className="w-full aspect-[3600/2560] relative overflow-hidden">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259785/postcard_2_s1tila.png" alt="Postcard Back" fill className="object-cover" />
                    </div>
                </div>

                {/* Desktop: tactile postcards layout */}
                <div className="hidden md:flex relative w-full max-w-[800px] h-[450px] items-center justify-center group cursor-pointer">
                    {/* Lined Back (Postcard 2) */}
                    <div className="absolute right-[10%] top-[60px] w-[440px] aspect-[1.45] bg-white transform rotate-[6deg] transition-all duration-500 group-hover:rotate-[2deg] group-hover:scale-105 group-hover:z-30 group-hover:-translate-x-4 overflow-hidden rounded-[8px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-[#E1DCD7]/40 z-0">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259785/postcard_2_s1tila.png" alt="Postcard Back" fill className="object-cover" />
                    </div>

                    {/* Beach Scene (Postcard 1) */}
                    <div className="absolute left-[5%] top-[20px] w-[440px] aspect-[1.45] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#E1DCD7]/40 transform rotate-[-4deg] z-10 transition-all duration-500 group-hover:rotate-[-6deg] group-hover:scale-[0.98] group-hover:opacity-90 rounded-[8px] overflow-hidden">
                        <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259787/Postcard_1_vggrdf.png" alt="Beach Scene" fill className="object-cover" />
                    </div>
                </div>
            </motion.section>

            {/* ── 5. FINAL CTA SECTION (STAMP BANNER) ── */}
            <motion.section
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full px-0 md:px-6 mb-16 md:mb-32 mt-0 md:mt-12 md:max-w-[1240px] md:mx-auto"
            >
                <div className="w-full bg-white md:rounded-[4px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-y md:border border-[#1a1a1a]/5 overflow-hidden relative flex items-center justify-center min-h-[340px] md:min-h-[420px] py-14 md:py-12">

                    {/* Scattered Stamps — hidden on mobile */}
                    <div className="absolute inset-0 pointer-events-none hidden md:block">
                        {/* Top Left */}
                        <div className="absolute left-[30px] top-[20px] w-[90px] h-[120px] rotate-[-8deg] opacity-90 transition-transform duration-500 hover:rotate-0">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259784/Basic_stamp_ow9rf4.png" alt="Stamp" fill className="object-contain" />
                        </div>
                        {/* Bottom Left */}
                        <div className="absolute left-[50px] bottom-[30px] w-[90px] h-[120px] rotate-[12deg] opacity-90 transition-transform duration-500 hover:rotate-0">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259783/Basic_stamp-1_foeywo.png" alt="Stamp" fill className="object-contain" />
                        </div>
                        {/* Top Right */}
                        <div className="absolute right-[40px] top-[40px] w-[90px] h-[120px] rotate-[6deg] opacity-90 transition-transform duration-500 hover:rotate-0">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259782/Basic_stamp-2_pzfxwl.png" alt="Stamp" fill className="object-contain" />
                        </div>
                        {/* Bottom Right */}
                        <div className="absolute right-[20px] bottom-[20px] w-[90px] h-[120px] rotate-[-5deg] opacity-90 transition-transform duration-500 hover:rotate-0">
                            <Image src="https://res.cloudinary.com/dqwd7hbl6/image/upload/v1776259782/Basic_stamp-3_pspbqu.png" alt="Stamp" fill className="object-contain" />
                        </div>
                    </div>

                    {/* Center Content */}
                    <div className="flex flex-col items-center text-center px-6 z-10 gap-[8px]">
                        <h2 className="font-serif font-semibold text-[40px] md:text-[64px] leading-[1.1] text-[#1a1a1a] tracking-[-0.02em]">
                            start your first<br /> postcard
                        </h2>
                        <p className="font-sans text-[14px] md:text-[16px] text-[#1a1a1a]/60 tracking-tight font-medium">
                            it takes less than a minute
                        </p>
                        <div className="mt-6">
                            <Link href="/create" className="inline-flex h-[52px] items-center justify-center bg-[#1a1a1a] px-[80px] py-[16px] rounded-[8px] hover:bg-[#1a1a1a]/90 transition-all shadow-sm">
                                <span className="font-sans text-[#f8f4ef] text-[15px] tracking-[0.3px] font-normal">Send a postcard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* ── 6. FAQ SECTION ── */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full px-0 md:px-0 max-w-full md:max-w-[840px] md:mx-auto pb-24 md:pb-40 flex flex-col items-center"
            >
                <h3 className="font-serif font-bold text-[2.2rem] md:text-[2.25rem] text-[#1a1a1a] mb-8 md:mb-12 tracking-tight text-center px-4 md:px-0">frequently asked questions</h3>
                <div className="w-full flex flex-col gap-0 md:gap-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="w-full bg-white md:rounded-[2px] shadow-none md:shadow-[0_2px_12px_rgba(0,0,0,0.02)] border-b md:border border-[#1a1a1a]/5 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full px-10 md:px-8 py-6 md:py-7 flex justify-between items-center text-left bg-transparent border-none cursor-pointer group outline-none"
                            >
                                <span className={`font-sans font-medium text-[18px] md:text-[18px] transition-colors ${openFaq === i ? "text-[#1a1a1a]" : "text-[#1a1a1a]/80"}`}>
                                    {faq.q.charAt(0).toUpperCase() + faq.q.slice(1)}
                                </span>
                                <span className={`text-[#1a1a1a]/40 text-2xl font-light transition-all duration-300 shrink-0 ml-4 ${openFaq === i ? "rotate-45 text-[#1a1a1a]" : ""}`}>
                                    +
                                </span>
                            </button>
                            <AnimatePresence>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="font-sans text-[15px] md:text-[16px] leading-[1.94] text-[#1a1a1a]/60 px-10 md:px-8 pb-8 pr-16 tracking-[-0.02em]">
                                            {faq.a}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </motion.section>

        </main>
    );
}

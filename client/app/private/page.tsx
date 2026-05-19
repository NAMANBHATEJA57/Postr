"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

const ENVELOPE_IMG = "https://res.cloudinary.com/dqwd7hbl6/image/upload/v1778754037/close_letter_gfvlvf.png";

export default function PrivatePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"create" | "visit">("create");
  
  const [generatedCode, setGeneratedCode] = useState("K7M2QX");
  const [visitCode, setVisitCode] = useState("");
  
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Generate a visual placeholder code for the create tab on client
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
  }, []);

  const normalizedVisitCode = useMemo(() => visitCode.trim().toUpperCase(), [visitCode]);

  async function handleEnterSpace() {
    if (!normalizedVisitCode) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/private-spaces/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: normalizedVisitCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "This space doesn't exist");
      router.push(`/private/${data.space.id}`);
    } catch (err) {
      setError("This space doesn't exist");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateSpace() {
    setBusy(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/private-spaces"), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create a private space");
      router.push(`/private/${data.space.id}/create`);
    } catch (err) {
      setError("Could not create a private space");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f8f4ef] flex flex-col items-center pt-[80px] pb-[120px] px-[16px]">
      <div className="flex flex-col items-center w-full max-w-[400px]">
        {/* Header */}
        <h1 className="font-serif font-bold text-[56px] md:text-[64px] text-[#1a1a1a] leading-none mb-[12px] tracking-tight">
          private space
        </h1>
        <p className="font-sans text-[15px] md:text-[16px] text-[#666666] mb-[32px]">
          Create a space between you two
        </p>

        {/* Segmented Control */}
        <div className="flex items-center p-[6px] rounded-full border border-[#eadfd5] mb-[48px] w-full max-w-[360px]">
          <button
            onClick={() => { setActiveTab("create"); setError(""); }}
            className={`flex-1 py-[10px] text-[14px] font-sans transition-all rounded-full ${
              activeTab === "create" ? "bg-white text-[#1a1a1a] shadow-sm font-medium" : "text-[#666666] font-normal hover:text-[#1a1a1a]"
            }`}
          >
            Create Private Space
          </button>
          <button
            onClick={() => { setActiveTab("visit"); setError(""); }}
            className={`flex-1 py-[10px] text-[14px] font-sans transition-all rounded-full ${
              activeTab === "visit" ? "bg-white text-[#1a1a1a] shadow-sm font-medium" : "text-[#666666] font-normal hover:text-[#1a1a1a]"
            }`}
          >
            Visit Private Space
          </button>
        </div>

        {/* Envelope Image */}
        <div className="relative w-[280px] h-[180px] mb-[40px]">
          <Image src={ENVELOPE_IMG} alt="Envelope" fill className="object-contain" style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.05))" }} />
        </div>

        {/* Dynamic Content */}
        <div className="w-full flex flex-col items-center text-center">
          {activeTab === "create" ? (
            <>
              <h2 className="font-sans font-medium text-[16px] text-[#1a1a1a] mb-[4px]">
                Create a new space
              </h2>
              <p className="font-sans text-[13px] text-[#888888] mb-[24px]">
                A unique code will be created for you.
              </p>
              
              <div className="w-full bg-white rounded-[8px] p-[16px] mb-[24px] border border-[#eadfd5] flex items-center shadow-sm">
                <span className="font-sans text-[16px] text-[#1a1a1a] tracking-[1px] text-left">
                  {generatedCode}
                </span>
              </div>

              <button
                onClick={handleCreateSpace}
                disabled={busy}
                className="w-full bg-[#1a1a1a] text-[#f8f4ef] font-sans font-normal text-[15px] py-[16px] rounded-[8px] hover:bg-black transition-colors disabled:opacity-50"
              >
                Create private space
              </button>
            </>
          ) : (
            <>
              <h2 className="font-sans font-medium text-[16px] text-[#1a1a1a] mb-[4px]">
                Enter space code
              </h2>
              <p className="font-sans text-[13px] text-[#888888] mb-[24px]">
                Paste the code shared with you.
              </p>
              
              <div className="w-full mb-[24px]">
                <input
                  type="text"
                  value={visitCode}
                  onChange={(e) => setVisitCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                  placeholder="AB12CD"
                  className="w-full bg-white rounded-[8px] p-[16px] border border-[#eadfd5] font-sans text-[16px] text-[#1a1a1a] tracking-[1px] outline-none focus:border-[#1a1a1a] transition-colors shadow-sm placeholder:text-[#cccccc]"
                />
                {error && (
                  <p className="mt-[12px] font-sans text-[13px] text-[#888888]">
                    {error}
                  </p>
                )}
              </div>

              <button
                onClick={handleEnterSpace}
                disabled={!normalizedVisitCode || busy}
                className="w-full bg-[#1a1a1a] text-[#f8f4ef] font-sans font-normal text-[15px] py-[16px] rounded-[8px] hover:bg-black transition-colors disabled:opacity-50"
              >
                Enter private space
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PostcardLoader() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[#fcfaf7] rounded-xl overflow-hidden z-0 pointer-events-none w-full aspect-[3/2] border border-[#eadfd5]/30 shadow-sm"
      aria-hidden="true"
    >
      {/* Logo Silhouette with Cloudinary optimizations */}
      <div className="relative w-16 h-16 flex items-center justify-center opacity-30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://res.cloudinary.com/db4cbtzey/image/upload/f_auto,q_auto/v1772543945/Logo_z9pkxr.png"
          alt=""
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>

      {/* Warm Shimmer Sweep Overlay — matches the brand color palette */}
      <div className="absolute inset-0 z-10 animate-shimmer bg-gradient-to-r from-transparent via-[#eadfd5]/25 to-transparent" />
    </div>
  );
}

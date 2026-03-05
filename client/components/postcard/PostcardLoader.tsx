export default function PostcardLoader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 rounded-md overflow-hidden z-0 pointer-events-none w-full aspect-[3/2]" aria-hidden="true">
            {/* Logo Silhouette */}
            <div className="relative w-16 h-16 flex items-center justify-center opacity-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://res.cloudinary.com/db4cbtzey/image/upload/v1772543945/Logo_z9pkxr.png" alt="" className="w-full h-full object-contain mix-blend-multiply" />
            </div>

            {/* Shimmer Sweep Overlay */}
            <div className="absolute inset-0 z-10 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
    );
}

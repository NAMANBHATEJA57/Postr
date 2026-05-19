import Image, { ImageProps } from "next/image";
import { cloudinaryLoader } from "@/lib/cloudinary";

export default function CloudinaryImage({ src, loader, ...props }: ImageProps) {
  const isCloudinary = typeof src === "string" && src.includes("res.cloudinary.com");

  return (
    <Image
      src={src}
      loader={isCloudinary ? cloudinaryLoader : loader}
      {...props}
    />
  );
}

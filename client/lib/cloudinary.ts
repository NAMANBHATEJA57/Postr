/**
 * Cloudinary URL Optimization Utilities
 * Rewrites URLs to inject modern image formatting (f_auto) and compression (q_auto),
 * plus optional sizing tags to serve appropriate dimensions for responsive displays.
 */

export function getOptimizedCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;

  const beforeUpload = url.slice(0, uploadIndex + 8); // includes '/upload/'
  const afterUpload = url.slice(uploadIndex + 8);

  // Build transforms: f_auto (format), q_auto (quality compression)
  let transforms = "f_auto,q_auto";
  if (width) {
    // c_limit prevents upscaling smaller assets while resizing larger ones
    transforms += `,w_${width},c_limit`;
  }

  // Prevent double-applying optimization transforms
  if (afterUpload.startsWith("f_auto") || afterUpload.includes("/f_auto")) {
    return url;
  }

  return `${beforeUpload}${transforms}/${afterUpload}`;
}

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export function cloudinaryLoader({ src, width }: ImageLoaderProps): string {
  return getOptimizedCloudinaryUrl(src, width);
}

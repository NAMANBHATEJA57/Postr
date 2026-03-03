/**
 * API client - all requests go to backend server.
 * No secrets. Only NEXT_PUBLIC_API_URL is used.
 */

const getApiUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return url.replace(/\/$/, "");
};

export function apiUrl(path: string): string {
  const base = getApiUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

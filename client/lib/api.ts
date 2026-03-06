/**
 * API client - all requests go to backend server.
 * No secrets. Only NEXT_PUBLIC_API_URL is used.
 */

const getApiUrl = () => {
  // If NEXT_PUBLIC_API_URL is explicitly set (like in local dev), use it.
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Under a combined Vercel deployment, the API is just at the same origin under /api
  // But we want to return "" so that `/api/postcards` becomes exactly `/api/postcards` (relative).
  if (typeof window !== "undefined") {
    return ""; // Browser will automatically use the current origin
  }

  return "http://localhost:4000";
};

export function apiUrl(path: string): string {
  const base = getApiUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

import type { PostcardTheme } from "@/types/postcard";
import framed from "./framed";

export { framed as FRAMED_THEME };

// All postcards use the single framed theme.
// resolveTheme is kept as a shim for any existing callers during migration.
export function resolveTheme(_themeId?: string): PostcardTheme {
    return framed;
}

export const themeIds = ["framed"] as const;
export type ThemeId = "framed";

export default { framed };

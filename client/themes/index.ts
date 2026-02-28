import { PostcardTheme } from "@/types/postcard";
import minimalLight from "./minimal-light";
import framed from "./framed";
import fullBleed from "./full-bleed";

const themes: Record<string, PostcardTheme> = {
    "minimal-light": minimalLight,
    framed,
    "full-bleed": fullBleed,
};

export function resolveTheme(themeId: string): PostcardTheme {
    return themes[themeId] ?? minimalLight;
}

export const themeIds = Object.keys(themes) as Array<"minimal-light" | "framed" | "full-bleed">;

export default themes;

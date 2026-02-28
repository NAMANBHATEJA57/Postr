import type { PostcardTheme } from "@/types/postcard";

const framed: PostcardTheme = {
    id: "framed",
    colors: {
        background: "#F8F4EF",
        surface: "#FFFFFF",
        text: "#1A1A1A",
        textSecondary: "#555555",
        accent: "#A6998D",
        divider: "#E1DCD7",
    },
    typography: {
        headingFont: "Playfair Display, serif",
        bodyFont: "Inter, sans-serif",
        headingSize: "1.5rem",
        bodySize: "1.125rem",
        toFromSize: "0.875rem",
    },
    layout: {
        type: "framed",
    },
    spacing: {
        cardPadding: "1.5rem",
        contentGap: "1.25rem",
    },
};

export default framed;
export { framed as FRAMED_THEME };

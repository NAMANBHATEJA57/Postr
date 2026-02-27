import { PostcardTheme } from "@/types/postcard";

const fullBleed: PostcardTheme = {
    id: "full-bleed",
    colors: {
        background: "#1A1A1A",
        surface: "#1A1A1A",
        text: "#F8F4EF",
        textSecondary: "#C7C0B8",
        accent: "#A6998D",
        divider: "#555555",
    },
    typography: {
        headingFont: "Playfair Display, serif",
        bodyFont: "Inter, sans-serif",
        headingSize: "1.5rem",
        bodySize: "1rem",
        toFromSize: "0.875rem",
    },
    layout: {
        type: "full-bleed",
    },
    spacing: {
        cardPadding: "1.5rem",
        mediaPadding: "0",
        contentGap: "1rem",
    },
};

export default fullBleed;

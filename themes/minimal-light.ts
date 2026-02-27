import { PostcardTheme } from "@/types/postcard";

const minimalLight: PostcardTheme = {
    id: "minimal-light",
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
        bodySize: "1rem",
        toFromSize: "0.875rem",
    },
    layout: {
        type: "centered",
    },
    spacing: {
        cardPadding: "2.5rem",
        mediaPadding: "0",
        contentGap: "1.5rem",
    },
};

export default minimalLight;

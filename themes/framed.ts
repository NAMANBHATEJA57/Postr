import { PostcardTheme } from "@/types/postcard";

const framed: PostcardTheme = {
    id: "framed",
    colors: {
        background: "#F8F4EF",
        surface: "#F8F4EF",
        text: "#1A1A1A",
        textSecondary: "#555555",
        accent: "#A6998D",
        divider: "#E1DCD7",
        border: "#C7C0B8",
    },
    typography: {
        headingFont: "Playfair Display, serif",
        bodyFont: "Inter, sans-serif",
        headingSize: "1.5rem",
        bodySize: "1rem",
        toFromSize: "0.875rem",
    },
    layout: {
        type: "framed",
    },
    spacing: {
        cardPadding: "2rem",
        mediaPadding: "1rem",
        contentGap: "1.25rem",
    },
};

export default framed;

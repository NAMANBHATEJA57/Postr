export type MediaType = "image" | "video";

export type ThemeLayout = "centered" | "framed" | "full-bleed";

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  divider: string;
  border?: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  headingSize: string;
  bodySize: string;
  toFromSize: string;
}

export interface ThemeSpacing {
  cardPadding: string;
  mediaPadding: string;
  contentGap: string;
}

export interface PostcardTheme {
  id: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: {
    type: ThemeLayout;
  };
  spacing: ThemeSpacing;
}

export type ExpiryOption = "never" | "24h" | "7d" | "30d" | "custom";

export interface PostcardData {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  title: string;
  message: string;
  toName: string;
  fromName: string;
  theme: string;
  expiryAt: string | null;
  createdAt: string;
}

export interface CreatePostcardPayload {
  mediaUrl: string;
  mediaType: MediaType;
  title: string;
  message: string;
  toName: string;
  fromName: string;
  theme: string;
  expiryAt: string | null;
  password?: string;
}

export interface ApiPostcardResponse {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  title: string;
  message: string;
  toName: string;
  fromName: string;
  theme: string;
  expiryAt: string | null;
  isPasswordProtected: boolean;
  createdAt: string;
}

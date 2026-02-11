export const TS_COLORS = {
  coral: "#FF6B6B",      // Primary - Coral Red
  yellow: "#FFD166",     // Secondary - Warm Yellow
  navy: "#1A1A40",       // Dark Base - Deep Navy
  gray: "#F5F5F5",       // Neutral Light - Soft Gray
  ink: "#0F1222",        // Text Neutral - Ink Gray
  teal: "#00B8A9",       // Accent Cool - Teal Blue
  error: "#E63946",      // Error Red
  success: "#06D6A0",    // Success Green
};

export const BRAND = {
  name: "BetterOpnr",
  tagline: "Start better conversations — get more replies.",
  gradient: "bg-bo-gradient",
  tones: ["Playful", "Sincere", "Confident", "Funny"] as const,
};

// PROD_CLEANUP: Centralized feature flag for guest generation (set false to disable entirely)
export const ENABLE_GUEST_GENERATION = true;

export type ToneName = typeof BRAND.tones[number];

export const TS_COLORS = {
  coral: "#FF6B6B",
  yellow: "#FFD166",
  navy: "#1A1A40",
  gray: "#F5F5F5",
  ink: "#0F1222",
};

export const BRAND = {
  name: "BetterOpnr",
  tagline: "Because every great story starts with a spark.",
  gradient: "bg-ts-gradient",
  tones: ["Playful", "Sincere", "Confident", "Funny"] as const,
};

export type ToneName = typeof BRAND.tones[number];

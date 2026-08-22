export const COLORS = {
  // Clean Frost & Ceramic Light Luxury Palette (From Reference Photos)
  background: "#EDF1F7",
  backgroundElevated: "#E4E9F2",
  surface: "#FFFFFF",
  surfaceElevated: "#F8FAFC",
  surfaceHighlight: "#F1F5F9",
  surfaceCard: "#FFFFFF",

  // High-Contrast Accent & Dark Actions
  primary: "#111827",
  primaryDark: "#0B0F19",
  electricBlue: "#2563EB",
  electricBlueBright: "#3B82F6",
  sunriseOrange: "#FF7A00",
  neonCyan: "#06B6D4",

  // Clean Trading Colors (From Reference Photos)
  buyGreen: "#10B981",
  buyGreenBright: "#059669",
  buyGreenMuted: "rgba(16, 185, 129, 0.12)",
  neonGreen: "#10B981",
  mintWave: "#2DD4BF",
  amberBull: "#FACC15",

  sellRed: "#EF4444",
  sellRedBright: "#DC2626",
  sellRedMuted: "rgba(239, 68, 68, 0.10)",

  // Typography Hierarchy (High Contrast)
  textPrimary: "#0B0F19",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  textDisabled: "#CBD5E1",
  textInverse: "#FFFFFF",

  // Borders & Dividers
  border: "rgba(0, 0, 0, 0.06)",
  borderLight: "rgba(0, 0, 0, 0.04)",
  borderBlue: "rgba(37, 99, 235, 0.15)",
  borderGreen: "rgba(16, 185, 129, 0.2)",
  borderRed: "rgba(239, 68, 68, 0.2)",

  // Overlays & Shadows
  overlay: "rgba(15, 23, 42, 0.6)",
  cardShadow: "rgba(15, 23, 42, 0.05)",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  xxl: 30,
  full: 9999,
};

export const SHADOWS = {
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  glowBlue: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  softGlow: {
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
};

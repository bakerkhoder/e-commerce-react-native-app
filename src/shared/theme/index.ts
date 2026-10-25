export const APP_NAME = "baladi"; // placeholder brand name

export const colors = {
  sea: "#1B5E8C",
  lemon: "#F2C94C",
  leaf: "#2F8F5B",
  tomato: "#D9483B",
  chalk: "#F3F5F6",
  surface: "#FFFFFF",
  ink: "#17263A",
  muted: "#5F6F7F",
  line: "#DDE3E8",
  onSea: "#FFFFFF",
  seaSoft: "#E0EDF6",
  tomatoSoft: "#FBE3E0",
  leafSoft: "#E2F3E8",
  lemonSoft: "#FFF3C4",
  scrim: "rgba(23,38,58,0.5)",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Different radii by role, rather than one radius slapped on everything. */
export const radius = {
  input: 12,
  button: 14,
  image: 18,
  sheet: 24,
  pill: 999,
} as const;

export const fonts = {
  body: "Cairo_500Medium",
  semibold: "Cairo_600SemiBold",
  bold: "Cairo_700Bold",
  black: "Cairo_800ExtraBold",
} as const;

export const typo = {
  display: { fontFamily: fonts.black, fontSize: 28, lineHeight: 36 },
  title: { fontFamily: fonts.black, fontSize: 20, lineHeight: 28 },
  heading: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  price: { fontFamily: fonts.black, fontSize: 17, lineHeight: 24 },
} as const;

export type TypoVariant = keyof typeof typo;

/**
 * Colour-coded aisles: five tints assigned by category id, so a new category
 * colours itself with no design work. The memorable element of the design.
 */
const AISLES = [
  { tint: "#E2F3E8", tone: "#2F7D4F" },
  { tint: "#E0EDF6", tone: "#1B5E8C" },
  { tint: "#FFF3C4", tone: "#8A6A00" },
  { tint: "#FBE3E0", tone: "#B83B30" },
  { tint: "#DAF1EF", tone: "#17766F" },
];

export const aisle = (categoryId?: number | null) =>
  AISLES[Math.abs(categoryId ?? 0) % AISLES.length];

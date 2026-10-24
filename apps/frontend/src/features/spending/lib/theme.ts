export type Palette = {
  key: string;
  label: string;
  hsl: string;
  deep: string;
  mid: string;
};

// Spending's main chart colours, from the theme (--spending-accent / -deep / -mid).
// Classic's are forest greens.
export const SPENDING_THEME: Palette = {
  key: "spending",
  label: "Spending",
  hsl: "var(--spending-accent)",
  deep: "var(--spending-deep)",
  mid: "var(--spending-mid)",
};

/** The accent at the given strength over transparent, for backgrounds and tints. */
export const themeBg = (p: Palette, alpha: number): string =>
  `color-mix(in oklab, ${p.hsl} ${Math.round(alpha * 100)}%, transparent)`;

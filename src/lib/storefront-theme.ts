type RGB = { r: number; g: number; b: number };

export type StorefrontThemeLike = {
  preset?: "minimal" | "bold" | "elegant";
  background_style?: "spotlight" | "solid" | "aurora";
  tokens?: {
    primary?: string;
    background?: string;
    surface?: string;
    text?: string;
    radius?: number;
    card_opacity?: number;
  };
};

export type StorefrontThemeTokens = {
  preset: NonNullable<StorefrontThemeLike["preset"]>;
  backgroundStyle: NonNullable<StorefrontThemeLike["background_style"]>;
  primary: string;
  background: string;
  surface: string;
  text: string;
  radius: number;
  cardOpacity: number;
};

const DEFAULTS: StorefrontThemeTokens = {
  preset: "minimal",
  backgroundStyle: "spotlight",
  primary: "#9fb6ff",
  background: "#05070d",
  surface: "#0b1220",
  text: "#e5e7eb",
  radius: 14,
  cardOpacity: 1,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): RGB | null {
  const raw = hex.replace("#", "").trim();
  if (raw.length === 3) {
    const r = parseInt(raw[0]! + raw[0]!, 16);
    const g = parseInt(raw[1]! + raw[1]!, 16);
    const b = parseInt(raw[2]! + raw[2]!, 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return { r, g, b };
  }
  return null;
}

function rgbToCss(rgb: RGB, alpha?: number) {
  if (typeof alpha === "number") {
    const a = clamp(alpha, 0, 1);
    return `rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${a})`;
  }
  return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  const k = clamp(t, 0, 1);
  return {
    r: Math.round(a.r + (b.r - a.r) * k),
    g: Math.round(a.g + (b.g - a.g) * k),
    b: Math.round(a.b + (b.b - a.b) * k),
  };
}

function relativeLuminance(rgb: RGB) {
  const toLinear = (v: number) => {
    const srgb = v / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function coerceStorefrontTheme(theme?: StorefrontThemeLike): StorefrontThemeTokens {
  const preset = theme?.preset || DEFAULTS.preset;
  const backgroundStyle = theme?.background_style || DEFAULTS.backgroundStyle;
  const primary = theme?.tokens?.primary || DEFAULTS.primary;
  const background = theme?.tokens?.background || DEFAULTS.background;
  const surface = theme?.tokens?.surface || DEFAULTS.surface;
  const text = theme?.tokens?.text || DEFAULTS.text;
  const radius = typeof theme?.tokens?.radius === "number" ? clamp(theme.tokens.radius, 0, 32) : DEFAULTS.radius;
  const cardOpacity =
    typeof theme?.tokens?.card_opacity === "number" ? clamp(theme.tokens.card_opacity, 0.55, 1) : DEFAULTS.cardOpacity;

  if (preset === "bold") {
    return {
      preset,
      backgroundStyle,
      primary,
      background,
      surface,
      text,
      radius: typeof theme?.tokens?.radius === "number" ? radius : 18,
      cardOpacity,
    };
  }

  if (preset === "elegant") {
    return {
      preset,
      backgroundStyle,
      primary,
      background,
      surface,
      text,
      radius: typeof theme?.tokens?.radius === "number" ? radius : 12,
      cardOpacity,
    };
  }

  return { preset, backgroundStyle, primary, background, surface, text, radius, cardOpacity };
}

export function createStorefrontCssVars(tokens: StorefrontThemeTokens): Record<string, string> {
  const primaryRgb = hexToRgb(tokens.primary) || hexToRgb(DEFAULTS.primary)!;
  const bgRgb = hexToRgb(tokens.background) || hexToRgb(DEFAULTS.background)!;
  const surfaceRgb = hexToRgb(tokens.surface) || hexToRgb(DEFAULTS.surface)!;
  const textRgb = hexToRgb(tokens.text) || hexToRgb(DEFAULTS.text)!;

  const onPrimary = relativeLuminance(primaryRgb) > 0.55 ? "#05070d" : "#e5e7eb";

  const outlineAlpha = tokens.preset === "bold" ? 0.28 : tokens.preset === "elegant" ? 0.18 : 0.22;
  const outlineVariantAlpha = tokens.preset === "bold" ? 0.4 : tokens.preset === "elegant" ? 0.26 : 0.32;

  const containerLowest = mix(bgRgb, surfaceRgb, 0.15);
  const containerLow = mix(bgRgb, surfaceRgb, 0.25);
  const container = mix(bgRgb, surfaceRgb, 0.36);
  const containerHigh = mix(bgRgb, surfaceRgb, 0.46);
  const containerHighest = mix(bgRgb, surfaceRgb, 0.6);
  const surfaceVariant = mix(surfaceRgb, primaryRgb, 0.08);

  const radiusDefault = Math.round(tokens.radius * 0.6);
  const radiusLg = tokens.radius;
  const radiusXl = Math.round(tokens.radius * 1.1);

  const cardAlpha = tokens.cardOpacity;

  return {
    "--color-primary": tokens.primary,
    "--color-on-primary": onPrimary,
    "--color-primary-container": rgbToCss(mix(bgRgb, primaryRgb, 0.25), cardAlpha),
    "--color-on-primary-container": rgbToCss(textRgb),

    "--color-background": tokens.background,
    "--color-on-background": rgbToCss(textRgb),
    "--color-surface": rgbToCss(surfaceRgb),
    "--color-on-surface": rgbToCss(textRgb),

    "--color-surface-container-lowest": rgbToCss(containerLowest, cardAlpha),
    "--color-surface-container-low": rgbToCss(containerLow, cardAlpha),
    "--color-surface-container": rgbToCss(container, cardAlpha),
    "--color-surface-container-high": rgbToCss(containerHigh, cardAlpha),
    "--color-surface-container-highest": rgbToCss(containerHighest, cardAlpha),
    "--color-surface-variant": rgbToCss(surfaceVariant, cardAlpha),

    "--color-on-surface-variant": rgbToCss(textRgb, 0.78),
    "--color-outline": rgbToCss(textRgb, outlineAlpha),
    "--color-outline-variant": rgbToCss(textRgb, outlineVariantAlpha),

    "--radius-DEFAULT": `${clamp(radiusDefault, 0, 32)}px`,
    "--radius-lg": `${clamp(radiusLg, 0, 32)}px`,
    "--radius-xl": `${clamp(radiusXl, 0, 32)}px`,
    "--radius-full": "9999px",
  };
}

export function createStorefrontBackground(tokens: StorefrontThemeTokens) {
  const a = tokens.preset === "bold" ? "2e" : tokens.preset === "elegant" ? "18" : "22";
  const b = tokens.preset === "bold" ? "22" : tokens.preset === "elegant" ? "10" : "15";

  if (tokens.backgroundStyle === "solid") return tokens.background;

  if (tokens.backgroundStyle === "aurora") {
    return `radial-gradient(800px 500px at 15% 0%, ${tokens.primary}${a} 0%, transparent 55%), radial-gradient(700px 500px at 85% 25%, ${tokens.primary}${b} 0%, transparent 55%), linear-gradient(120deg, ${tokens.primary}10 0%, transparent 65%), ${tokens.background}`;
  }

  return `radial-gradient(600px 600px at 10% 10%, ${tokens.primary}${a} 0%, transparent 55%), radial-gradient(600px 600px at 90% 20%, ${tokens.primary}${b} 0%, transparent 55%), ${tokens.background}`;
}


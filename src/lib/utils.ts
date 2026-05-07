/**
 * Format cents to a human-readable USD string.
 * formatCents(150000) => "$1,500.00"
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Clamp a value between a min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validate that a URL is a plausible external file link.
 */
export function isValidExternalLink(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

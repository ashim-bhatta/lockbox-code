export function asNonEmptyString(value: unknown, field: string, maxLen = 512) {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required.`);
  if (trimmed.length > maxLen) throw new Error(`${field} is too long.`);
  return trimmed;
}

export function asOptionalString(value: unknown, field: string, maxLen = 1024) {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLen) throw new Error(`${field} is too long.`);
  return trimmed;
}

export function asInteger(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${field} must be an integer.`);
  }
  if (value < min || value > max) {
    throw new Error(`${field} must be between ${min} and ${max}.`);
  }
  return value;
}

export function asOptionalInteger(value: unknown, field: string, min: number, max: number, fallback: number) {
  if (value === undefined || value === null) return fallback;
  return asInteger(value, field, min, max);
}

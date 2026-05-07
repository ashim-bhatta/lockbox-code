import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;

export function hashLockboxPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyLockboxPassword(password: string, storedHash: string) {
  const [salt, hashHex] = storedHash.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, actual);
}

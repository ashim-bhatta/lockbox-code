import "server-only";

import crypto from "node:crypto";

type RestoreTokenPayload = {
  v: 1;
  d: string; // delivery id
  e: string; // email
  exp: number; // unix seconds
};

function getSecret() {
  const secret = process.env.RESTORE_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing RESTORE_TOKEN_SECRET (or SUPABASE_SERVICE_ROLE_KEY) environment variable.");
  }
  return secret;
}

function sign(input: string) {
  return crypto.createHmac("sha256", getSecret()).update(input).digest("base64url");
}

export function createRestoreToken(input: { deliveryId: string; email: string; expiresAt: Date }) {
  const payload: RestoreTokenPayload = {
    v: 1,
    d: input.deliveryId,
    e: input.email,
    exp: Math.floor(input.expiresAt.getTime() / 1000),
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyRestoreToken(token: string): { deliveryId: string; email: string; expiresAt: Date } | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== signatureBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return null;

  let payload: RestoreTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as RestoreTokenPayload;
  } catch {
    return null;
  }
  if (payload?.v !== 1) return null;
  if (typeof payload.d !== "string" || typeof payload.e !== "string" || typeof payload.exp !== "number") return null;

  const expiresAt = new Date(payload.exp * 1000);
  if (Number.isNaN(expiresAt.getTime())) return null;
  if (Date.now() > expiresAt.getTime()) return null;

  return { deliveryId: payload.d, email: payload.e, expiresAt };
}

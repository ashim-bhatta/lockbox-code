import { NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getProfileByUserId } from "@/server/services/profile-service";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfileByUserId(user.id);
  const connected = Boolean(profile?.stripe_account_id);

  return NextResponse.json({
    connected,
    stripe_account_id: profile?.stripe_account_id || null,
    email: profile?.email || user.email || null,
  });
}

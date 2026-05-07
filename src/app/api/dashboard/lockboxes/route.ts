import { NextResponse } from "next/server";
import { getRecentDashboardLockboxes } from "@/server/services/dashboard-service";
import { getRequestUser } from "@/server/services/auth-service";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await getRecentDashboardLockboxes(user.id);
  return NextResponse.json({ rows });
}

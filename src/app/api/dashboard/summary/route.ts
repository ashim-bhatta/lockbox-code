import { NextResponse } from "next/server";
import { getDashboardSummaryForUser } from "@/server/services/dashboard-service";
import { getRequestUser } from "@/server/services/auth-service";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await getDashboardSummaryForUser(user.id);
  return NextResponse.json(summary);
}

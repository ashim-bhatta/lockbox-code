import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getAnalyticsData } from "@/server/services/analytics-service";

export async function GET(req: NextRequest) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const analytics = await getAnalyticsData(user.id, {
    from: from || undefined,
    to: to || undefined,
  });
  return NextResponse.json(analytics);
}

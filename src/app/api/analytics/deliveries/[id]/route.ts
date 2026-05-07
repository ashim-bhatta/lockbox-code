import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getLockboxAnalyticsData } from "@/server/services/lockbox-analytics-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  try {
    const analytics = await getLockboxAnalyticsData(user.id, id, {
      from: from || undefined,
      to: to || undefined,
    });
    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load analytics." },
      { status: 404 }
    );
  }
}


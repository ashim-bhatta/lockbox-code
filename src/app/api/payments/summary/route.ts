import { NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getPaymentsSummary } from "@/server/services/payments-service";

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await getPaymentsSummary(user.id);
  return NextResponse.json(summary);
}

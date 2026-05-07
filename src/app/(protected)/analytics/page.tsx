import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AnalyticsClientContent } from "@/components/dashboard/AnalyticsClientContent";
import { getAnalyticsData } from "@/server/services/analytics-service";
import { getRequestUser } from "@/server/services/auth-service";

export default async function AnalyticsPage() {
  const user = await getRequestUser();
  if (!user) return null;
  const analytics = await getAnalyticsData(user.id);

  return (
    <DashboardLayout activeNav="analytics">
      <AnalyticsClientContent initial={analytics} />
    </DashboardLayout>
  );
}

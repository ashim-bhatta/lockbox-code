import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LockboxAnalyticsClientContent } from "@/components/dashboard/LockboxAnalyticsClientContent";
import { getLockboxAnalyticsData } from "@/server/services/lockbox-analytics-service";
import { getRequestUser } from "@/server/services/auth-service";

export default async function LockboxAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getRequestUser();
  if (!user) return null;

  const { id } = await params;
  const analytics = await getLockboxAnalyticsData(user.id, id);

  return (
    <DashboardLayout activeNav="lockboxes">
      <LockboxAnalyticsClientContent deliveryId={id} initial={analytics} />
    </DashboardLayout>
  );
}


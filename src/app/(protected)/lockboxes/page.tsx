import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LockboxesList } from "@/components/dashboard/LockboxesSections";
import { getLockboxListRows } from "@/server/services/dashboard-service";
import { getRequestUser } from "@/server/services/auth-service";

export default async function LockboxesPage() {
  const user = await getRequestUser();
  if (!user) return null;
  const lockboxes = await getLockboxListRows(user.id);

  return (
    <DashboardLayout activeNav="lockboxes">
      <LockboxesList lockboxes={lockboxes} />
    </DashboardLayout>
  );
}

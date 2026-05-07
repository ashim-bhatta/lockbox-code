import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StorefrontBuilder } from "@/components/storefront-builder/StorefrontBuilder";

export default function StorefrontSettingsPage() {
  return (
    <DashboardLayout activeNav="settings">
      <StorefrontBuilder />
    </DashboardLayout>
  );
}


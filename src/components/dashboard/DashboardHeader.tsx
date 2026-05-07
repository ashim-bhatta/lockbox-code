"use client";

import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPrimitives";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { LockboxFormDialog } from "@/components/lockbox-form/LockboxFormDialog";
import { ModalTriggerButton } from "@/components/ui/buttons/ModalTriggerButton";

export function DashboardHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DashboardPageHeader
        title="Dashboard"
        subtitle="Welcome back. Here is your overview for today."
        actions={
          <ModalTriggerButton onClick={() => setOpen(true)}>
            <AppIcon name="add" size={16} />
            Create Lockbox
          </ModalTriggerButton>
        }
      />
      <LockboxFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

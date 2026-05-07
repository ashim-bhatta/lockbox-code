"use client";

import { Suspense } from "react";
import { DeliveryContent } from "@/components/delivery/DeliveryContent";
import { PageLoader } from "@/components/ui/states/PageLoader";

export default function DeliveryPage() {
  return (
    <Suspense
      fallback={<PageLoader label="Loading lockbox..." />}
    >
      <DeliveryContent />
    </Suspense>
  );
}

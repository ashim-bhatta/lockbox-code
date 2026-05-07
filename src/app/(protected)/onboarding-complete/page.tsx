"use client";

import { Suspense } from "react";
import { OnboardingContent } from "@/components/onboarding/OnboardingContent";
import { PageLoader } from "@/components/ui/states/PageLoader";

export default function OnboardingCompletePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OnboardingContent />
    </Suspense>
  );
}

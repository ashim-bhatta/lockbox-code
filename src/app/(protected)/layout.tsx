import type { ReactNode } from "react";
import { requireAuthenticatedUser } from "@/lib/auth-guards";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireAuthenticatedUser();
  return children;
}

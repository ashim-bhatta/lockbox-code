import type { ReactNode } from "react";
import { redirectIfAuthenticated } from "@/lib/auth-guards";

export default async function AuthGuestLayout({ children }: { children: ReactNode }) {
  await redirectIfAuthenticated("/dashboard");
  return children;
}

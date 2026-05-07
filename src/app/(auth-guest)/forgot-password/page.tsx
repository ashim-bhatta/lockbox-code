import { AuthLayout } from "@/components/auth/layouts/AuthLayout";
import { ForgotPasswordCard } from "@/components/auth/forgot/ForgotPasswordCard";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout mode="forgot">
      <ForgotPasswordCard />
    </AuthLayout>
  );
}

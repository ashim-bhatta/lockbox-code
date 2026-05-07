import { AuthLayout } from "@/components/auth/layouts/AuthLayout";
import { LoginCard } from "@/components/auth/login/LoginCard";

export default function LoginPage() {
  return (
    <AuthLayout mode="login">
      <LoginCard />
    </AuthLayout>
  );
}

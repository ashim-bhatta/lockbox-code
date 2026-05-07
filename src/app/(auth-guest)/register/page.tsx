import { RegisterCard } from "@/components/auth/register/RegisterCard";
import { RegisterTopBar } from "@/components/auth/register/RegisterTopBar";
import { SiteFooter } from "@/components/shared/SiteFooter";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-on-background">
      <div className="pointer-events-none fixed left-[-10%] top-[-20%] z-0 h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] z-0 h-[60%] w-[60%] rounded-full bg-secondary-container/5 blur-[150px]" />

      <RegisterTopBar />

      <main className="relative z-10 mx-auto flex w-full max-w-container-max flex-grow items-center justify-center px-4 pb-24 pt-32">
        <RegisterCard />
      </main>

      <SiteFooter />
    </div>
  );
}

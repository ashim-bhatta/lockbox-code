export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-on-surface">
      <h1 className="mb-6 text-3xl font-semibold">Help</h1>
      <div className="space-y-4 text-sm text-on-surface-variant">
        <p>Create a lockbox from your dashboard, set a price, then share the generated delivery link.</p>
        <p>When a client pays, access is unlocked and payment status updates automatically.</p>
        <p>For onboarding or payout issues, check settings and reconnect Stripe if needed.</p>
      </div>
    </main>
  );
}

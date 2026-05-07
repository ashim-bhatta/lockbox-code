export default function SecurityPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-on-surface">
      <h1 className="mb-6 text-3xl font-semibold">Security</h1>
      <div className="space-y-4 text-sm text-on-surface-variant">
        <p>Paywall.zip uses signed Stripe webhooks and server-side verification for payment status changes.</p>
        <p>Sensitive operations are performed server-side with authenticated access checks.</p>
        <p>If you discover a security issue, report it immediately on the support page.</p>
      </div>
    </main>
  );
}

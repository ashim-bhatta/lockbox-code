export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-on-surface">
      <h1 className="mb-6 text-3xl font-semibold">Terms of Service</h1>
      <div className="space-y-6 text-sm text-on-surface-variant">
        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Service scope</h2>
          <p>
            Paywall.zip provides lockbox-based delivery links for digital work and routes payments through Stripe
            Connect destination charges.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Creator responsibilities</h2>
          <p>
            You must upload lawful content, provide accurate pricing, and keep secure links valid. You are responsible
            for client communications and fulfillment quality.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Payments, tips, and fees</h2>
          <p>
            Platform fees are applied per lockbox based on the configured fee percent. Optional client tips are added
            at checkout. Payout timing and settlement are controlled by Stripe.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Refunds and disputes</h2>
          <p>
            Refund and dispute events can change lockbox payment state (for example, paid to refunded/disputed) and
            may affect access and reporting. Users agree to cooperate with legitimate support requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Prohibited use</h2>
          <p>
            Fraud, charge abuse, malware distribution, phishing content, unlawful material, or attempts to bypass
            payment/access controls are prohibited and may result in suspension.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Availability and changes</h2>
          <p>
            We may update product features, limits, and policies as the platform evolves. Continued use of Paywall.zip
            means acceptance of updated terms.
          </p>
        </section>
      </div>
    </main>
  );
}

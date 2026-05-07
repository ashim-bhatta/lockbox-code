export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-on-surface">
      <h1 className="mb-6 text-3xl font-semibold">Privacy Policy</h1>
      <div className="space-y-6 text-sm text-on-surface-variant">
        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">What we collect</h2>
          <p>
            We collect account details (name, email), lockbox metadata (title, preview text, preview URL, price), and
            operational audit records needed to keep delivery and payment flows reliable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Payment data</h2>
          <p>
            Payments are processed by Stripe. We store Stripe identifiers (session, payment intent, transfer/payout
            references) and payment status for reconciliation, disputes, refunds, and support.
          </p>
          <p>We do not store full card numbers or card CVC on Paywall.zip servers.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">How data is used</h2>
          <p>
            Data is used to generate secure delivery links, calculate fees/tips, verify webhook events, and notify
            buyers/freelancers via transactional email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Retention and deletion</h2>
          <p>
            We retain required financial and audit records for fraud prevention and accounting obligations. For account
            deletion requests, contact support and include your account email.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-medium text-on-surface">Security practices</h2>
          <p>
            We use authenticated API access controls, signed Stripe webhook verification, server-side validation, and
            event reconciliation for payment reliability.
          </p>
        </section>
      </div>
    </main>
  );
}

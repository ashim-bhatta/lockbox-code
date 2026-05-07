"use client";

import Image from "next/image";

export function TestimonialsSection() {
  return (
    <section id="proof" className="mb-32">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="glass-panel rounded-xl border-l-2 border-l-primary-container p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-outline-variant bg-surface-container-lowest">
              <Image
                alt=""
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCK8QoSr3YDufHTlG8FmTEVWls80AF_X5cRHYgh4ml6ceMFKAn7InaJFIIKkgCNtTZ25dGmUm4vM7GakK1lDa21g0tpYEs9SeOBEaedRFItnedbrMEbltlEXnwY-8EV-cGOuUHBqk2VsbTLzhpk9v3edkIPToYeiz4Mo46t9HR1aCUpVQl_qGXVKO2fGEch5jwdLeMkGqERWMZdTXkZuIVS7DrQ60P70CyLAgNfoFGoKcSvla5NSTkCfoA61p-6slGrOklerc97UVw"
                width={48}
                height={48}
              />
            </div>
            <div>
              <div className="font-label-sm text-label-sm font-bold text-on-surface">Marcus T.</div>
              <div className="font-mono-data text-[11px] text-outline">Full-Stack Engineer</div>
            </div>
          </div>
          <p className="font-body-base text-body-base italic text-on-surface-variant">
            {"\"I built a custom dashboard for a new client and they ghosted me right before final delivery. Now, I put everything in Paywall.zip. I send them a link to a live, read-only demo embedded in the lockbox. When they want the source code, they pay. Zero anxiety.\""}
          </p>
        </div>
        <div className="glass-panel rounded-xl border-l-2 border-l-tertiary-container p-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-outline-variant bg-surface-container-lowest">
              <Image
                alt=""
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi_r9600551lFaIj96yXKsn_k-x_KCZ8gqGYeqIBQ4ipGN2UaxggIQgNPikacAOUugYX5FQkI9mWfdPw19453jlcBiP81N3d9bWYnAU3kKlo0UDG8vXhVHGn829EIAOc3mLs9KekJDc1WEO-yye1pkaKkJ3t9FA1o1urnT-MC6fSqKjt3uuwhKxoSS32SiremwzSCcnVvb93LAyrE6RshL99vT7OMHS6uKSrNGkN7nReoFOKRFnB79XCyKyaorDq9IJKPrxAwL0ok"
                width={48}
                height={48}
              />
            </div>
            <div>
              <div className="font-label-sm text-label-sm font-bold text-on-surface">Sarah K.</div>
              <div className="font-mono-data text-[11px] text-outline">Brand Identity Designer</div>
            </div>
          </div>
          <p className="font-body-base text-body-base italic text-on-surface-variant">
            {"\"Watermarking PDFs manually was tedious and unprofessional. Paywall.zip handles the presentation layer beautifully. Clients see the polished brand guidelines, pay the invoice right there, and get the raw vector files instantly. It's elevated my entire offboarding process.\""}
          </p>
        </div>
      </div>
    </section>
  );
}

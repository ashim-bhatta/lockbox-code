"use client"

import { FeaturesSection } from "@/components/landing/sections/FeaturesSection"
import { FinalCtaSection } from "@/components/landing/sections/FinalCtaSection"
import { HeroSection } from "@/components/landing/sections/HeroSection"
import { TestimonialsSection } from "@/components/landing/sections/TestimonialsSection"
import { TrustArchitectureSection } from "@/components/landing/sections/TrustArchitectureSection"
import { LandingTopNav } from "@/components/landing/LandingTopNav"
import { SiteFooter } from "@/components/shared/SiteFooter"

export default function LandingPage() {
  function scrollToSection(id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <LandingTopNav onNavigate={scrollToSection} />

      <main className='relative z-10 mx-auto max-w-[1200px] px-4 pb-24 pt-32 sm:px-8'>
        <div className='pointer-events-none fixed left-1/2 top-1/4 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary-container/10 blur-[120px]' />
        <HeroSection onNavigate={scrollToSection} />
        <FeaturesSection />
        <TrustArchitectureSection />
        <TestimonialsSection />
        <FinalCtaSection onNavigate={scrollToSection} />
      </main>

      <SiteFooter />
    </>
  )
}

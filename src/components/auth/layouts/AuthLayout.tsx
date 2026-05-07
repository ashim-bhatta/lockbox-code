"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { SiteFooter } from "@/components/shared/SiteFooter"

type AuthLayoutProps = {
  children: ReactNode
  mode: "login" | "register" | "forgot"
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  if (mode === "register") {
    return (
      <div className='relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background font-body-base text-on-background'>
        <div className='absolute inset-0 z-0'>
          <div className='absolute inset-0 bg-gradient-to-br from-surface-container to-background opacity-80 mix-blend-overlay' />
          <Image
            alt='Background'
            className='object-cover opacity-30'
            src='https://lh3.googleusercontent.com/aida-public/AB6AXuAv8vGD3lubPx2Or5Z3OPxTWCfC-wh7dhuecBBUgH0CJd0CXk8I5nWPikJeqE5joBKEhkqd29r9ChBi7BcnhGOj39N-nOa2Bi8NXUKVgUsDusq1PJZ0SmzKTqm6rnyOAkJ1PyCgb8dmyiSBu0ZcuKe9uMqXemUIXBuPyQPcg2ByO7kC-T6yVzOGUkYsv0Z5mY9qk-ZDkKQWYUnyWljftvp2DPZCfeynPgyaTrlAvHSw7JAbPtGTUXv6iRerx9VA5WW36sqlis_l7kI'
            fill
          />
          <div className='absolute inset-0 bg-background/60 backdrop-blur-[20px]' />
        </div>
        <div className='relative z-10 w-full max-w-md px-4'>{children}</div>
      </div>
    )
  }

  if (mode === "forgot") {
    return (
      <div className='relative flex min-h-screen flex-col overflow-hidden bg-background text-on-background antialiased'>
        <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center'>
          <div className='h-[600px] w-[600px] rounded-full bg-primary/5 blur-[100px]' />
        </div>
        <main className='relative z-10 flex flex-grow items-center justify-center p-6'>
          <div className='w-full max-w-md'>{children}</div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden bg-surface-container-lowest font-body-base text-on-surface antialiased'>
      <div className='pointer-events-none absolute left-1/4 top-0 h-[50vw] w-[50vw] -translate-y-1/2 transform rounded-full bg-primary-container/10 mix-blend-screen blur-[120px]' />
      <div className='pointer-events-none absolute bottom-0 right-1/4 h-[40vw] w-[40vw] translate-y-1/3 transform rounded-full bg-secondary-container/5 mix-blend-screen blur-[100px]' />
      <main className='relative z-10 flex flex-grow items-center justify-center'>
        <div className='w-full max-w-[420px] px-6 py-10'>{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import { AuthGlassCard } from "@/components/auth/ui/AuthGlassCard"
import { FieldLabel, IconInput } from "@/components/auth/ui/AuthFields"
import { PrimaryAction } from "@/components/auth/ui/AuthButtons"
import { AppIcon } from "@/components/ui/icons/AppIcon"
import { useAuthSubmitState } from "@/components/auth/hooks/useAuthSubmitState"
import {
  getSupabaseBrowserClient,
  getSupabasePublicEnvError,
} from "@/lib/supabase-browser"
import { STRIPE_SUPPORTED_COUNTRIES } from "@/lib/constants/countries"

export function RegisterCard() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [country, setCountry] = useState("US")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { error, message, isSubmitting, setMessage, run } = useAuthSubmitState()
  const feedbackId = "register-feedback"
  const hasError = Boolean(error)

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await run(async () => {
      const envError = getSupabasePublicEnvError()
      if (envError) throw new Error(envError)
      if (!acceptedTerms) {
        throw new Error("You must accept Terms of Service and Privacy Policy.")
      }

      const origin = window.location.origin
      const supabase = getSupabaseBrowserClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, country },
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      })

      if (signUpError) throw new Error(signUpError.message)
      setMessage("Account created. Check your inbox to verify your email.")
    })
  }

  return (
    <AuthGlassCard className='group relative w-full max-w-[480px] overflow-hidden border border-white/10 bg-surface-container/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-[20px]'>
      <div className='pointer-events-none absolute inset-0 rounded-xl border border-primary/0 transition-all duration-500 group-hover:border-primary/20 group-hover:shadow-[0_0_20px_rgba(41,121,255,0.15)]' />

      <div className='mb-margin text-center'>
        <h1 className='mb-2 font-headline-md text-headline-md tracking-tight text-on-surface'>
          Join the Future of Freelancing
        </h1>
        <p className='font-body-base text-body-base text-on-surface-variant'>
          Create your secure Paywall.zip account.
        </p>
      </div>

      <form className='flex flex-col gap-gutter' onSubmit={handleRegister}>
        <div className='relative flex flex-col gap-2'>
          <FieldLabel htmlFor='fullName' className='uppercase tracking-wider'>Full Name</FieldLabel>
          <div className='relative'>
            <input
              id='fullName'
              type='text'
              placeholder='John Doe'
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={hasError}
              aria-describedby={hasError || message ? feedbackId : undefined}
              className='w-full rounded-DEFAULT border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-base text-body-base text-on-surface shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 placeholder:text-outline focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50'
            />
          </div>
        </div>

        <div className='relative flex flex-col gap-2'>
          <FieldLabel htmlFor='country' className='uppercase tracking-wider'>Country</FieldLabel>
          <div className='relative'>
            <select
              id='country'
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-invalid={hasError}
              aria-describedby={hasError || message ? feedbackId : undefined}
              className='w-full cursor-pointer appearance-none rounded-DEFAULT border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-base text-body-base text-on-surface shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50'
            >
              {STRIPE_SUPPORTED_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant'>
              <AppIcon name='expand_more' />
            </div>
          </div>
        </div>

        <div className='relative flex flex-col gap-2'>
          <FieldLabel htmlFor='email' className='uppercase tracking-wider'>Email Address</FieldLabel>
          <IconInput id='email' type='email' placeholder='john@example.com' icon='mail' value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={hasError} aria-describedby={hasError || message ? feedbackId : undefined} className='rounded-DEFAULT border-outline-variant bg-surface-container-lowest py-3 pr-10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50' />
        </div>

        <div className='relative flex flex-col gap-2'>
          <FieldLabel htmlFor='password' className='uppercase tracking-wider'>Password</FieldLabel>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? "text" : "password"}
              placeholder='••••••••'
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={hasError}
              aria-describedby={hasError || message ? feedbackId : undefined}
              className='w-full rounded-DEFAULT border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-base text-body-base text-on-surface shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-300 placeholder:text-outline focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50'
            />
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant transition-colors hover:text-on-surface focus:outline-none'
              type='button'
            >
              <AppIcon name='visibility' />
            </button>
          </div>
        </div>

        <div className='mt-2 flex items-start gap-3'>
          <div className='flex h-5 items-center'>
            <input
              id='terms'
              type='checkbox'
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className='h-4 w-4 cursor-pointer rounded-DEFAULT border-outline-variant bg-surface-container-lowest text-primary transition-colors duration-200 focus:ring-primary focus:ring-offset-background'
            />
          </div>
          <label
            className='cursor-pointer select-none font-body-base text-sm text-body-base text-on-surface-variant'
            htmlFor='terms'
          >
            I agree to the{" "}
            <Link
              className='text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-fixed'
              href='/terms'
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              className='text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary-fixed'
              href='/privacy'
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        <PrimaryAction
          disabled={isSubmitting}
          className='group relative mt-4 w-full overflow-hidden rounded-DEFAULT bg-primary py-4 font-label-sm text-label-sm font-bold uppercase tracking-[0.1em] text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_15px_rgba(176,198,255,0.1)] transition-all duration-300 hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_20px_rgba(176,198,255,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'
        >
          <span className='relative z-10 flex items-center justify-center gap-2'>
            {isSubmitting ? "Creating Account..." : "Create Account"}
            <AppIcon name='arrow_forward' size={18} />
          </span>
          <div className='absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </PrimaryAction>

        {(error || message) && <p id={feedbackId} role={error ? "alert" : "status"} aria-live='polite' className={`text-center text-sm ${error ? "text-error" : "text-secondary-container"}`}>{error || message}</p>}
      </form>

      <div className='mt-8 border-t border-white/5 pt-6 text-center'>
        <p className='font-body-base text-sm text-body-base text-on-surface-variant'>
          Already have an account?
          <Link
            className='ml-1 font-medium text-primary transition-colors hover:text-primary-fixed'
            href='/login'
          >
            Log in securely
          </Link>
        </p>
      </div>
    </AuthGlassCard>
  )
}

"use client"

import { AppIcon } from "@/components/ui/icons/AppIcon"
import Link from "next/link"
import { StripeConnectButton } from "@/components/dashboard/StripeConnectButton"
import { StripeLoginButton } from "@/components/dashboard/StripeLoginButton"

export function DashboardStatusBanner({
  availableBalanceLabel,
  hasAccountId,
  isFullyConnected,
}: {
  availableBalanceLabel: string
  hasAccountId: boolean
  isFullyConnected: boolean
}) {
  return (
    <div className='border-razor group relative flex flex-col items-center justify-between gap-6 bg-surface-container-low p-6 transition-premium hover:bg-black sm:flex-row'>
      <div className='absolute top-0 left-0 h-2 w-2 border-l border-t border-tertiary/40' />

      <div className='z-10 flex items-center gap-6'>
        <div className='relative flex h-12 w-12 items-center justify-center border-razor bg-black text-tertiary'>
          <AppIcon name='account_balance_wallet' size={20} />
          <div className='pulse-active absolute -right-1 -top-1 h-3 w-3 rounded-full bg-tertiary shadow-[0_0_10px_oklch(80%_0.15_80_/_0.3)]' />
        </div>
        <div>
          <p className='font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-surface-variant'>
            LIQUIDITY_STATUS
          </p>
          <div className='mt-1 flex items-center gap-3'>
            {isFullyConnected ? (
              <span className='font-display-lg text-xl text-on-surface'>
                SYNCED:{" "}
                <span className='text-tertiary'>{availableBalanceLabel}</span>
              </span>
            ) : (
              <span className='font-display-lg text-xl text-error'>
                NODE_OFFLINE: {availableBalanceLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className='flex gap-4'>
        {isFullyConnected ? (
          <Link
            href='/settings'
            className='border-razor px-8 py-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant transition-premium hover:bg-surface-container-high hover:text-on-surface'
          >
            MANAGE RAIL
          </Link>
        ) : hasAccountId ? (
          <StripeLoginButton
            label='COMPLETE KYC'
            className='btn-primary px-10 py-3 font-mono-data text-[10px] uppercase tracking-widest'
          />
        ) : (
          <StripeConnectButton
            label='INITIALIZE LINK'
            className='btn-primary px-10 py-3 font-mono-data text-[10px] uppercase tracking-widest'
          />
        )}
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'

import type { ShellToolbarAction } from '../types'

interface MapToolbarProps {
  actions: ShellToolbarAction[]
  onAction: (actionId: string) => void
}

export function Toolbar({ actions, onAction }: MapToolbarProps) {
  return (
    <div className='pointer-events-none absolute left-5 right-5 top-5 z-30 flex items-start justify-between gap-4'>
      <div className='pointer-events-auto flex items-center gap-3'>
        <button
          type='button'
          className='flex h-14 w-14 items-center justify-center rounded-full border border-neutral-800/90 bg-neutral-950/90 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl'
          aria-label='OmniSpatial AI'
        >
          <div className='h-10 w-10 rounded-full bg-[radial-gradient(circle_at_32%_28%,#fafafa_0%,#737373_38%,#171717_100%)] shadow-[0_0_24px_rgba(255,255,255,0.12)]' />
        </button>

        <div className='flex h-14 items-center gap-3 rounded-full border border-neutral-800/90 bg-neutral-900/90 px-4 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl'>
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.id}
                type='button'
                onClick={() => onAction(action.id)}
                title={action.label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-50',
                  action.active ? 'bg-neutral-800 text-neutral-50 shadow-[inset_0_0_0_1px_rgba(64,64,64,0.9)]' : ''
                )}
              >
                <Icon className='h-4 w-4' />
              </button>
            )
          })}
        </div>
      </div>

      <button
        type='button'
        className='pointer-events-auto flex h-11 min-w-11 items-center justify-center rounded-full border border-neutral-800/90 bg-neutral-950/90 px-3 text-sm font-medium text-neutral-50 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-xl'
      >
        OA
      </button>
    </div>
  )
}

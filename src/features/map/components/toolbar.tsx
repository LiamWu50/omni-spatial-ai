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
          className='earth-panel flex h-14 w-14 items-center justify-center rounded-full border-white/15 bg-white/8'
          aria-label='OmniSpatial AI'
        >
          <div className='h-10 w-10 rounded-full bg-[radial-gradient(circle_at_32%_28%,#7dd3fc_0%,#2563eb_40%,#1e1b4b_100%)] shadow-[0_0_32px_rgba(96,165,250,0.45)]' />
        </button>

        <div className='earth-toolbar flex h-14 items-center gap-3 rounded-full px-4'>
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.id}
                type='button'
                onClick={() => onAction(action.id)}
                title={action.label}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white',
                  action.active ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]' : ''
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
        className='earth-panel pointer-events-auto flex h-11 min-w-11 items-center justify-center rounded-full border-white/15 bg-white/10 px-3 text-sm font-medium text-white'
      >
        OA
      </button>
    </div>
  )
}

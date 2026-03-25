'use client'

import { ComposerPrimitive } from '@assistant-ui/react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { type FocusEvent, useState } from 'react'

import { cn } from '@/lib/utils'

interface PromptProps {
  variant?: 'overlay' | 'docked'
}

export function Prompt({ variant = 'overlay' }: PromptProps) {
  const isOverlay = variant === 'overlay'
  const [overlayExpanded, setOverlayExpanded] = useState(false)
  const isExpanded = !isOverlay || overlayExpanded

  const handleBlurCapture = (event: FocusEvent<HTMLFormElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }

    setOverlayExpanded(false)
  }

  return (
    <div
      className={cn(
        isOverlay ? 'pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-4' : 'w-full'
      )}
    >
      <div
        className={cn(
          'w-full transition-[max-width,transform] duration-300 ease-out',
          isOverlay ? 'pointer-events-auto max-w-[480px]' : 'max-w-none',
          isOverlay && isExpanded ? 'max-w-[700px]' : ''
        )}
      >
        <ComposerPrimitive.Root
          onFocusCapture={() => {
            if (isOverlay) {
              setOverlayExpanded(true)
            }
          }}
          onBlurCapture={isOverlay ? handleBlurCapture : undefined}
          className={cn(
            'flex w-full flex-col border border-white/10 bg-black/88 text-white backdrop-blur-2xl transition-[min-height,border-radius,box-shadow,background-color,padding,gap] duration-300 ease-out',
            isOverlay
              ? 'min-h-[72px] rounded-[20px] px-5 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.36)]'
              : 'min-h-[146px] gap-3 rounded-[28px] px-5 py-4 shadow-[0_22px_64px_rgba(0,0,0,0.42)]',
            isOverlay && isExpanded
              ? 'min-h-[112px] gap-3 rounded-[24px] border-white/18 bg-black/92 px-5 py-4 shadow-[0_24px_64px_rgba(0,0,0,0.44)]'
              : ''
          )}
        >
          <div
            className={cn(
              'flex min-h-0 flex-1 gap-3',
              isOverlay ? (isExpanded ? 'items-start' : 'items-center') : 'items-start'
            )}
          >
            {isOverlay ? (
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/58'>
                <Sparkles className='h-4 w-4' />
              </span>
            ) : null}

            <ComposerPrimitive.Input
              placeholder='输入地图指令或问题...'
              className={cn(
                'w-full resize-none overflow-y-auto bg-transparent p-0 text-white outline-none placeholder:text-white/56',
                isOverlay
                  ? isExpanded
                    ? 'min-h-[48px] max-h-[120px] text-[17px] leading-7'
                    : 'h-7 min-h-7 max-h-7 text-[17px] leading-7'
                  : 'min-h-[64px] max-h-[180px] text-[17px] leading-7'
              )}
            />
          </div>

          {isExpanded ? (
            <div className='mt-1 flex max-h-16 items-center justify-between gap-3 overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out'>
              <button
                type='button'
                className={cn(
                  'inline-flex items-center gap-2 rounded-full text-white/88 transition',
                  isOverlay ? 'h-8 px-1 text-[12px]' : 'h-9 px-1.5 text-sm'
                )}
                aria-label='当前模型'
              >
                {!isOverlay ? (
                  <span className='flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white'>
                    <Sparkles className='h-3.5 w-3.5' />
                  </span>
                ) : null}
                <span className='font-semibold'>GPT-5.4 Nano</span>
              </button>

              <ComposerPrimitive.Send asChild>
                <button
                  type='submit'
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-[18px] bg-white/72 text-black transition hover:bg-white/82 disabled:cursor-not-allowed disabled:opacity-40',
                    isOverlay ? 'h-11 w-11 rounded-[16px]' : 'h-12 w-12'
                  )}
                  aria-label='发送'
                >
                  <ArrowUp className={cn(isOverlay ? 'h-5 w-5' : 'h-5.5 w-5.5')} />
                </button>
              </ComposerPrimitive.Send>
            </div>
          ) : null}
        </ComposerPrimitive.Root>
      </div>
    </div>
  )
}

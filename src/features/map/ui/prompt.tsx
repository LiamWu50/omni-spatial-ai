'use client'

import { ComposerPrimitive } from '@assistant-ui/react'
import { ArrowUp, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PromptProps {
  variant?: 'overlay' | 'docked'
}

export function Prompt({ variant = 'overlay' }: PromptProps) {
  const isOverlay = variant === 'overlay'

  return (
    <div
      className={cn(
        isOverlay ? 'pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-4' : 'w-full'
      )}
    >
      <div
        className={cn(
          'w-full transition-[max-width,transform] duration-300 ease-out',
          isOverlay ? 'pointer-events-auto max-w-[560px] focus-within:max-w-[720px]' : 'max-w-none'
        )}
      >
        <ComposerPrimitive.Root
          className={cn(
            'group/prompt flex w-full flex-col border border-white/10 bg-black/88 text-white backdrop-blur-2xl transition-[min-height,border-radius,box-shadow,background-color,padding,gap] duration-300 ease-out',
            isOverlay
              ? 'min-h-[74px] gap-0 rounded-[20px] px-5 py-3 shadow-[0_18px_48px_rgba(0,0,0,0.36)] focus-within:min-h-[112px] focus-within:gap-3 focus-within:rounded-[24px] focus-within:border-white/18 focus-within:bg-black/92 focus-within:px-5 focus-within:py-4 focus-within:shadow-[0_24px_64px_rgba(0,0,0,0.44)]'
              : 'min-h-[146px] gap-3 rounded-[28px] px-5 py-4 shadow-[0_22px_64px_rgba(0,0,0,0.42)]'
          )}
        >
          <div className='flex min-h-0 flex-1 items-start gap-3'>
            {isOverlay ? (
              <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/58'>
                <Sparkles className='h-4 w-4' />
              </span>
            ) : null}
            <ComposerPrimitive.Input
              placeholder='Ask a question...'
              className={cn(
                'w-full resize-none overflow-y-auto bg-transparent p-0 text-white outline-none placeholder:text-white/56',
                isOverlay
                  ? 'min-h-[32px] max-h-[120px] pt-0.5 text-[17px] leading-7 focus-within:min-h-[48px]'
                  : 'min-h-[64px] max-h-[180px] text-[17px] leading-7'
              )}
            />
          </div>

          <div
            className={cn(
              'flex items-center justify-between gap-3 overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out',
              isOverlay
                ? 'mt-0 max-h-0 opacity-0 group-focus-within/prompt:mt-1 group-focus-within/prompt:max-h-16 group-focus-within/prompt:opacity-100'
                : 'mt-1 max-h-16 opacity-100'
            )}
          >
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
        </ComposerPrimitive.Root>
      </div>
    </div>
  )
}

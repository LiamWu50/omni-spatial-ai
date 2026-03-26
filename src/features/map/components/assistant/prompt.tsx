'use client'

import { ComposerPrimitive } from '@assistant-ui/react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { type FocusEvent, useState } from 'react'

import { cn } from '@/lib/utils'
import { SelectModel } from './select-model'

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
        isOverlay ? 'pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-2' : 'w-full'
      )}
    >
      <div
        className={cn(
          'w-full transition-[max-width,transform] duration-300 ease-out',
          isOverlay ? 'pointer-events-auto max-w-[260px]' : 'max-w-none',
          isOverlay && isExpanded ? 'max-w-[460px]' : ''
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
            'flex w-full flex-col border border-(--module-panel-border) bg-(--module-panel-bg) text-neutral-900 shadow-(--module-panel-shadow) backdrop-blur-[20px] transition-[min-height,border-radius,box-shadow,background-color,padding,gap] duration-300 ease-out dark:text-neutral-50',
            isOverlay
              ? 'min-h-[36px] rounded-[12px] px-3.5 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]'
              : 'min-h-[96px] gap-2 rounded-[20px] px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.32)]',
            isOverlay && isExpanded
              ? 'min-h-[88px] gap-2 rounded-[16px] px-3.5 py-2.5 shadow-[0_18px_40px_rgba(15,23,42,0.16)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.34)]'
              : ''
          )}
        >
          <div
            className={cn(
              'flex min-h-0 flex-1 gap-2',
              isOverlay ? (isExpanded ? 'items-start' : 'items-center') : 'items-start'
            )}
          >
            {isOverlay && !isExpanded ? (
              <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-500 dark:text-neutral-400'>
                <Sparkles className='h-3.5 w-3.5' />
              </span>
            ) : null}

            <ComposerPrimitive.Input
              placeholder='输入地图指令或问题...'
              style={{ fontSize: '12px', lineHeight: '18px' }}
              className={cn(
                'w-full resize-none overflow-y-auto bg-transparent p-0 text-[12px]! text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-50 dark:placeholder:text-neutral-500',
                isOverlay
                  ? isExpanded
                    ? 'min-h-[36px] max-h-[88px] leading-[18px]!'
                    : 'h-[18px] min-h-[18px] max-h-6 leading-[18px]!'
                  : 'min-h-[48px] max-h-[112px] leading-[18px]!'
              )}
            />
          </div>

          {isExpanded ? (
            <div className='mt-1 flex max-h-11 items-center justify-between gap-2 overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out'>
              <SelectModel className='h-8 rounded-full px-2.5 text-[12px]! sm:text-[12px]!' />

              <ComposerPrimitive.Send asChild>
                <button
                  type='submit'
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center rounded-[2px] bg-(--module-primary-bg) text-(--module-primary-text) transition-[background-color,color,opacity] duration-180 hover:bg-(--module-primary-hover-bg) disabled:cursor-not-allowed disabled:opacity-40',
                    isOverlay ? 'h-8 w-8 rounded-[12px]' : 'h-9 w-9 rounded-[14px]'
                  )}
                  aria-label='发送'
                >
                  <ArrowUp className={cn(isOverlay ? 'h-4 w-4' : 'h-4.5 w-4.5')} />
                </button>
              </ComposerPrimitive.Send>
            </div>
          ) : null}
        </ComposerPrimitive.Root>
      </div>
    </div>
  )
}

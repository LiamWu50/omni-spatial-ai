'use client'

import { ComposerPrimitive } from '@assistant-ui/react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { type FocusEvent, type FormEvent, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { SelectModel } from './model-select'

interface PromptProps {
  variant?: 'overlay' | 'docked'
  onSubmitted?: () => void
}

export function Prompt({ variant = 'overlay', onSubmitted }: PromptProps) {
  const isOverlay = variant === 'overlay'
  const [overlayExpanded, setOverlayExpanded] = useState(false)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isExpanded = !isOverlay || overlayExpanded

  const handleBlurCapture = (event: FocusEvent<HTMLFormElement>) => {
    if (modelMenuOpen) {
      return
    }

    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return
    }

    setOverlayExpanded(false)
  }

  const handleModelMenuOpenChange = (open: boolean) => {
    setModelMenuOpen(open)

    if (!open && isOverlay) {
      window.setTimeout(() => {
        const activeElement = document.activeElement

        if (!rootRef.current?.contains(activeElement)) {
          setOverlayExpanded(false)
        }
      }, 0)
    }
  }

  const handleSubmitCapture = (event: FormEvent<HTMLFormElement>) => {
    if (!isOverlay || !onSubmitted) {
      return
    }

    const field = event.currentTarget.querySelector('textarea, input')
    const nextValue =
      field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement ? field.value.trim() : ''

    if (!nextValue) {
      return
    }

    window.setTimeout(() => {
      onSubmitted()
      setOverlayExpanded(false)
    }, 0)
  }

  return (
    <div
      className={cn(
        isOverlay ? 'pointer-events-none absolute inset-x-0 bottom-12 z-20 flex justify-center px-2' : 'w-full'
      )}
    >
      <div
        ref={rootRef}
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
          onSubmitCapture={handleSubmitCapture}
          onBlurCapture={isOverlay ? handleBlurCapture : undefined}
          className={cn(
            'group flex w-full flex-col border border-(--module-panel-border) bg-(--module-panel-bg) text-neutral-900 shadow-(--module-panel-shadow) backdrop-blur-[20px] transition-all duration-300 ease-out dark:text-neutral-50',
            isOverlay
              ? 'min-h-[36px] rounded-[12px] px-3.5 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)] focus-within:ring-2 focus-within:ring-neutral-200 dark:focus-within:ring-neutral-800'
              : 'min-h-[84px] gap-3 rounded-[24px] px-4 pb-3 pt-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.24)] focus-within:border-neutral-300 dark:focus-within:border-neutral-700',
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
              style={{ fontSize: '13px', lineHeight: '20px' }}
              className={cn(
                'w-full resize-none overflow-y-auto bg-transparent p-0 text-[13px]! text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-50 dark:placeholder:text-neutral-500',
                isOverlay
                  ? isExpanded
                    ? 'min-h-[36px] max-h-[88px] leading-[20px]!'
                    : 'h-[20px] min-h-[20px] max-h-6 leading-[20px]!'
                  : 'min-h-[44px] max-h-[120px] leading-[20px]!'
              )}
            />
          </div>

          {isExpanded ? (
            <div className='mt-1 flex max-h-11 items-center justify-between gap-2 overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-out'>
              <SelectModel className='mr-auto shrink-0' onOpenChange={handleModelMenuOpenChange} />
              <ComposerPrimitive.Send asChild>
                <button
                  type='submit'
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center bg-(--module-primary-bg) text-(--module-primary-text) transition-all duration-200 hover:bg-(--module-primary-hover-bg) disabled:cursor-not-allowed disabled:opacity-40',
                    isOverlay
                      ? 'h-6 w-6 rounded-[8px]'
                      : 'h-8 w-8 rounded-full shadow-sm hover:scale-105 active:scale-95'
                  )}
                  aria-label='发送'
                >
                  <ArrowUp strokeWidth={2.5} className={cn(isOverlay ? 'h-3 w-3' : 'h-4 w-4')} />
                </button>
              </ComposerPrimitive.Send>
            </div>
          ) : null}
        </ComposerPrimitive.Root>
      </div>
    </div>
  )
}

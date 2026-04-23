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
            'group flex w-full flex-col border border-border bg-card text-foreground transition-all duration-300 ease-out font-body shadow-sm',
            isOverlay
              ? 'min-h-[36px] rounded-[24px] px-3.5 py-2 focus-within:ring-2 focus-within:ring-brand-green/60 focus-within:border-brand-green focus-within:shadow-[0_0_0_4px_rgba(30,215,96,0.15)]'
              : 'min-h-[84px] gap-3 rounded-[8px] px-4 pb-3 pt-4 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/40 focus-within:shadow-[0_0_0_3px_rgba(30,215,96,0.1)]',
            isOverlay && isExpanded
              ? 'min-h-[88px] gap-2 rounded-[12px] px-3.5 py-2.5'
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
              <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-secondary'>
                <Sparkles className='h-3.5 w-3.5' />
              </span>
            ) : null}

            <ComposerPrimitive.Input
              placeholder='输入地图指令或问题...'
              style={{ fontSize: '13px', lineHeight: '20px' }}
              className={cn(
                'w-full resize-none overflow-y-auto bg-transparent p-0 text-[13px]! text-foreground outline-none placeholder:text-text-muted font-body',
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
                    'inline-flex shrink-0 items-center justify-center bg-primary text-primary-foreground transition-all duration-200 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40',
                    isOverlay
                      ? 'h-6 w-6 rounded-full'
                      : 'h-8 w-8 rounded-full'
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

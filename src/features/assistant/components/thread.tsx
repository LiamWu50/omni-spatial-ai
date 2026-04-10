'use client'

import { ThreadPrimitive } from '@assistant-ui/react'
import { ChevronDown } from 'lucide-react'
import { useRef } from 'react'

import ScrollFade from '@/components/ui/scroll-fade'

import { MAP_ASSISTANT_EMPTY_HINT } from '../lib/default-thread-copy'
import { MapAssistantMessage, MapUserMessage } from './messages'

interface AssistantThreadProps {
  open: boolean
}

export function AssistantThread({ open }: AssistantThreadProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ThreadPrimitive.Root className='flex min-h-0 flex-1 flex-col'>
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          <ThreadPrimitive.Viewport
            ref={viewportRef}
            autoScroll
            scrollToBottomOnRunStart
            scrollToBottomOnInitialize
            className='h-full min-h-0 overflow-y-auto px-5 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
          >
            <div className='flex min-h-full flex-col'>
              <ThreadPrimitive.If empty>
                <div className='flex flex-1 items-center justify-center px-6 text-center text-sm text-text-muted font-body'>
                  {MAP_ASSISTANT_EMPTY_HINT}
                </div>
              </ThreadPrimitive.If>
              <ThreadPrimitive.Messages
                components={{
                  UserMessage: MapUserMessage,
                  AssistantMessage: MapAssistantMessage
                }}
              />
            </div>
          </ThreadPrimitive.Viewport>
          <ScrollFade
            axis='vertical'
            intensity={0.9}
            containerRef={viewportRef}
            overlayClassName='inset-x-5 inset-y-0'
          />
          <ThreadPrimitive.ScrollToBottom
            behavior='smooth'
            className='absolute bottom-4 right-7 z-20 flex h-9 w-9 items-center justify-center rounded-0 border border-border bg-card text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:opacity-50 disabled:pointer-events-none disabled:translate-y-1 disabled:opacity-0'
            aria-label='回到底部'
          >
            <ChevronDown className='h-4 w-4' />
          </ThreadPrimitive.ScrollToBottom>
        </div>
      </ThreadPrimitive.Root>
    </div>
  )
}

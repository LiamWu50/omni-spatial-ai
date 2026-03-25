'use client'

import { ThreadPrimitive } from '@assistant-ui/react'
import type { ReactNode } from 'react'

import { MapAssistantMessage, MapUserMessage } from './messages'

interface AssistantProps {
  open: boolean
  footer?: ReactNode
}

export function Assistant({ open, footer }: AssistantProps) {
  return (
    <aside
      className={`flex h-full min-h-0 flex-col bg-[rgba(6,8,12,0.94)] transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ThreadPrimitive.Root className='flex min-h-0 flex-1 flex-col'>
        <ThreadPrimitive.Viewport className='min-h-0 flex-1 px-5 py-6'>
          <div className='flex min-h-full flex-col'>
            <ThreadPrimitive.If empty>
              <div className='flex flex-1 items-center justify-center px-6 text-center text-[15px] text-white/52'>
                Ask me anything about assistant-ui
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
      </ThreadPrimitive.Root>

      {footer ? <div className='px-5 pb-5'>{footer}</div> : null}
    </aside>
  )
}

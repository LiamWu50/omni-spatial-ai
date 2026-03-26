'use client'

import { ThreadPrimitive } from '@assistant-ui/react'

import { MapAssistantMessage, MapUserMessage } from './messages'

interface AssistantThreadProps {
  open: boolean
}

export function AssistantThread({ open }: AssistantThreadProps) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col transition-opacity duration-300 ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <ThreadPrimitive.Root className='flex min-h-0 flex-1 flex-col'>
        <ThreadPrimitive.Viewport className='min-h-0 flex-1 px-5 py-6'>
          <div className='flex min-h-full flex-col'>
            <ThreadPrimitive.If empty>
              <div className='flex flex-1 items-center justify-center px-6 text-center text-[15px] text-neutral-500 dark:text-neutral-500'>
                试试输入：定位、切换影像底图、打开图层。
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
    </div>
  )
}

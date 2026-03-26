'use client'

import { MessagePrimitive } from '@assistant-ui/react'

export function MapAssistantMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-start'>
      <div className='max-w-[90%] rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-50 backdrop-blur'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

export function MapUserMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-end'>
      <div className='max-w-[90%] rounded-2xl bg-neutral-50 px-3 py-2 text-sm leading-6 text-neutral-900'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

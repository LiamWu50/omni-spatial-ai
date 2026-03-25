'use client'

import { MessagePrimitive } from '@assistant-ui/react'

export function MapAssistantMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-start'>
      <div className='max-w-[90%] rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm leading-6 text-white backdrop-blur'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

export function MapUserMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-end'>
      <div className='max-w-[90%] rounded-2xl bg-white px-3 py-2 text-sm leading-6 text-black'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

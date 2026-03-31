'use client'

import { MessagePrimitive } from '@assistant-ui/react'

export function MapUserMessage() {
  return (
    <MessagePrimitive.Root className='relative mx-auto flex w-full max-w-3xl justify-end py-3'>
      <div className='max-w-[80%]'>
        <div className='rounded-2xl bg-black/6 px-4 py-2 text-[13px] leading-5 text-foreground backdrop-blur-[1px] dark:bg-white/6'>
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}

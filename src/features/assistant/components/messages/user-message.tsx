'use client'

import { MessagePrimitive } from '@assistant-ui/react'

export function MapUserMessage() {
  return (
    <MessagePrimitive.Root className='relative mx-auto flex w-full max-w-3xl justify-end py-3'>
      <div className='max-w-[80%]'>
        <div className='rounded-2xl bg-neutral-900 px-4 py-2 text-[13px] leading-5 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900'>
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}

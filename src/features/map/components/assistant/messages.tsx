'use client'

import { MessagePrimitive } from '@assistant-ui/react'

export function MapAssistantMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-start'>
      <div className='max-w-[90%] rounded-2xl border border-(--module-panel-border) bg-(--module-panel-bg-subtle) px-3 py-2 text-sm leading-6 text-neutral-900 backdrop-blur dark:text-neutral-50'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

export function MapUserMessage() {
  return (
    <MessagePrimitive.Root className='mb-2 flex w-full justify-end'>
      <div className='max-w-[90%] rounded-2xl bg-neutral-900 px-3 py-2 text-sm leading-6 text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900'>
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  )
}

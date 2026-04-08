'use client'

import { MessagePrimitive, useAssistantState } from '@assistant-ui/react'
import { Loader2 } from 'lucide-react'

import { ToolFallback } from '../tools'

const assistantMessageComponents = {
  tools: { Fallback: ToolFallback }
}

export function MapAssistantMessage() {
  const hasContent = useAssistantState((state: any) => {
    const message = state.message

    return (
      (typeof message.content === 'string' && message.content.length > 0) ||
      (Array.isArray(message.content) && message.content.length > 0)
    )
  })

  const isLoading = useAssistantState((state: any) => {
    const message = state.message
    const isRunning = state.thread.isRunning
    const messages = state.thread.messages
    const isLast = messages[messages.length - 1]?.id === message.id

    return isRunning && isLast
  })

  return (
    <MessagePrimitive.Root className='relative mx-auto w-full max-w-3xl py-3'>
      <div className='min-w-0 text-[13px] leading-5 text-foreground'>
        {isLoading && !hasContent ? (
          <div className='flex items-center gap-2 text-muted-foreground text-xs'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>AI 正在思考...</span>
          </div>
        ) : (
          <>
            <MessagePrimitive.Content components={assistantMessageComponents} />
            {!hasContent && !isLoading && <span className='text-muted-foreground text-xs italic'>无内容</span>}
          </>
        )}
      </div>
    </MessagePrimitive.Root>
  )
}

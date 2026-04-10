'use client'

import { ChevronDown } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMapAssistantChatContext } from '@/features/assistant/provider'
import type { ChatModelId } from '@/lib/ai/models'
import { CHAT_MODEL_OPTIONS } from '@/lib/ai/models'
import { cn } from '@/lib/utils'

interface SelectModelProps {
  className?: string
  onOpenChange?: (open: boolean) => void
}

export const SelectModelComponent = ({ className, onOpenChange }: SelectModelProps) => {
  const { selectedModel, setSelectedModel } = useMapAssistantChatContext()

  const selectedModelLabel = CHAT_MODEL_OPTIONS.find((model) => model.id === selectedModel)?.label ?? selectedModel

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          className={cn(
            'h-8 w-fit max-w-[112px] justify-start gap-1.5 rounded-0 px-2.5 text-[13px]! font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:opacity-50 sm:max-w-[140px]',
            className
          )}
        >
          <span className='truncate font-body'>{selectedModelLabel}</span>
          <ChevronDown className='size-3.5 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='min-w-[140px] rounded-0 border border-border p-1.5'
        align='start'
      >
        {CHAT_MODEL_OPTIONS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className={cn(
              'my-0.5 cursor-pointer rounded-0 px-3 py-2 text-[13px] font-body',
              selectedModel === model.id
                ? 'bg-surface-subtle font-medium text-foreground'
                : 'text-text-secondary'
            )}
            onSelect={() => setSelectedModel(model.id as ChatModelId)}
          >
            {model.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const SelectModel = React.memo(SelectModelComponent)

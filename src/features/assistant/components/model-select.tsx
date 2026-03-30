'use client'

import { ChevronDown } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useMapAssistantChatContext } from '@/features/assistant/provider'
import type { ChatModelId } from '@/features/map/lib/models'
import { CHAT_MODEL_OPTIONS } from '@/features/map/lib/models'
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
            'h-8 w-fit max-w-[112px] justify-start gap-1 rounded-full px-1.5 text-[12px]! text-neutral-500 hover:bg-transparent hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-transparent dark:hover:text-neutral-200 sm:max-w-[128px]',
            className
          )}
        >
          <span className='truncate'>{selectedModelLabel}</span>
          <ChevronDown className='size-3.5 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='rounded-xl p-1 shadow-lg' align='start'>
        {CHAT_MODEL_OPTIONS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className={cn(
              'my-1 cursor-pointer rounded-lg px-2.5 py-1.5 text-[12px]',
              selectedModel === model.id ? 'bg-accent text-accent-foreground' : ''
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

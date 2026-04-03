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
            'h-8 w-fit max-w-[112px] justify-start gap-1.5 rounded-full px-2.5 text-[13px]! font-medium text-neutral-500 transition-colors hover:bg-neutral-100/50 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-200 sm:max-w-[140px]',
            className
          )}
        >
          <span className='truncate'>{selectedModelLabel}</span>
          <ChevronDown className='size-3.5 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='min-w-[140px] rounded-xl border-neutral-200/60 p-1.5 shadow-xl dark:border-neutral-800/60' align='start'>
        {CHAT_MODEL_OPTIONS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className={cn(
              'my-0.5 cursor-pointer rounded-lg px-3 py-2 text-[13px] transition-colors',
              selectedModel === model.id ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50' : 'text-neutral-600 dark:text-neutral-300'
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

import { ChevronDown } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CHAT_MODEL_OPTIONS } from '@/features/map/lib/models'
// import { useChatContext } from '@/features/chat/providers/chat-provider'
import type { ModelOptions } from '@/features/map/types'
import { cn } from '@/lib/utils'

export const SelectModelComponent = ({ className }: { className?: string }) => {
  // const {
  //   chatOptions: { selectedModel, setSelectedModel }
  // } = useChatContext()
  let selectedModel = {} as ModelOptions
  const setSelectedModel = (model: ModelOptions) => {
    selectedModel = model
  }
  const selectedModelLabel =
    CHAT_MODEL_OPTIONS.find((model) => model.id === selectedModel)?.label ??
    CHAT_MODEL_OPTIONS[0]?.label ??
    selectedModel

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={cn('max-w-full rounded-full px-2.5 text-[12px]! sm:text-[12px]!', className)}
        >
          <span className='truncate'>{selectedModelLabel}</span>
          <ChevronDown className='size-3.5 opacity-50' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='rounded-xl p-1 shadow-lg' align='end'>
        {CHAT_MODEL_OPTIONS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className={`my-1 rounded-lg py-1.5 px-2.5 text-[12px] cursor-pointer ${
              selectedModel === model.id ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => setSelectedModel(model.id as ModelOptions)}
          >
            {model.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const SelectModel = React.memo(SelectModelComponent)

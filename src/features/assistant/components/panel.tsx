'use client'

import { MessageSquarePlus, PanelRightClose } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'

import { useResizablePanel } from '../../map/hooks/use-resizable-panel'
import { ASSISTANT_PANEL_DEFAULTS } from '../../map/lib/constants'
import { useMapAssistantChatContext } from '../provider'
import { Prompt } from './prompt'
import { AssistantThread } from './thread'

interface AssistantPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssistantPanel({ open, onOpenChange }: AssistantPanelProps) {
  const { isResizing, startResize, width } = useResizablePanel(ASSISTANT_PANEL_DEFAULTS)
  const { composerResetKey, resetConversation } = useMapAssistantChatContext()

  const assistantPanelStyle = useMemo(
    () => ({
      width: open ? `${width}px` : '0px'
    }),
    [open, width]
  )

  return (
    <div
      className={`relative shrink-0 overflow-visible border-l transition-[width,border-color] duration-300 ease-out ${
        open ? 'border-border' : 'border-transparent'
      } ${isResizing ? 'transition-none' : ''}`}
      style={assistantPanelStyle}
    >
      <div
        className={`absolute inset-y-0 left-0 z-30 w-5 -translate-x-1/2 cursor-col-resize ${open ? 'block' : 'hidden'}`}
        onPointerDown={startResize}
        role='separator'
        aria-label='调整对话详情宽度'
        aria-orientation='vertical'
      >
        <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-opacity' />
      </div>

      {open ? (
        <button
          type='button'
          onClick={() => onOpenChange(false)}
          className='absolute left-0 top-1/2 z-40 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-0 border border-border bg-card text-text-secondary transition-colors duration-180 hover:bg-surface-hover hover:opacity-50'
          aria-label='收起对话详情'
        >
          <PanelRightClose className='h-4 w-4' />
        </button>
      ) : null}

      <div className='h-full overflow-hidden'>
        <div className='flex h-full min-h-0 min-w-[320px] flex-col rounded-none border-0 bg-card'>
          <AssistantThread open={open} />
          <div className='px-5 pb-5'>
            <Prompt key={composerResetKey} variant='docked' />
            <div className='mt-2 flex justify-start'>
              <Button variant='ghost' size='xs' className='text-[12px]!' onClick={resetConversation}>
                <MessageSquarePlus className='h-3! w-3! shrink-0' />
                新建对话
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

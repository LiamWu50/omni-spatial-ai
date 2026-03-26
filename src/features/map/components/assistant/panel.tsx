'use client'

import { PanelRightClose } from 'lucide-react'
import { useMemo } from 'react'

import { useResizablePanel } from '../../hooks/use-resizable-panel'
import { ASSISTANT_PANEL_DEFAULTS } from '../../lib/constants'
import { Prompt } from './prompt'
import { AssistantThread } from './thread'

interface AssistantPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssistantPanel({ open, onOpenChange }: AssistantPanelProps) {
  const { isResizing, startResize, width } = useResizablePanel(ASSISTANT_PANEL_DEFAULTS)

  const assistantPanelStyle = useMemo(
    () => ({
      width: open ? `${width}px` : '0px'
    }),
    [open, width]
  )

  return (
    <div
      className={`relative shrink-0 overflow-hidden border-l border-neutral-200/0 transition-[width,border-color] duration-300 ease-out dark:border-neutral-800/0 ${
        open ? 'border-neutral-200 dark:border-neutral-800' : ''
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
        <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-neutral-200 transition-colors hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700' />
      </div>

      {open ? (
        <button
          type='button'
          onClick={() => onOpenChange(false)}
          className='absolute left-0 top-1/2 z-40 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-lg transition hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-900 dark:hover:text-neutral-50'
          aria-label='收起对话详情'
        >
          <PanelRightClose className='h-4 w-4' />
        </button>
      ) : null}

      <div className='flex h-full min-h-0 min-w-[320px] flex-col bg-white dark:bg-neutral-950'>
        <AssistantThread open={open} />
        <div className='px-5 pb-5'>
          <Prompt variant='docked' />
        </div>
      </div>
    </div>
  )
}

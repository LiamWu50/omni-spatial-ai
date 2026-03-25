'use client'

import { PanelRightClose } from 'lucide-react'
import { useMemo } from 'react'

import { useResizablePanel } from '../../hooks/use-resizable-panel'
import { ASSISTANT_PANEL_DEFAULTS } from '../../lib/constants'
import { AssistantThread } from './assistant-thread'
import { Prompt } from './prompt'

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
      className={`relative shrink-0 overflow-hidden border-l border-white/0 transition-[width,border-color] duration-300 ease-out ${
        open ? 'border-white/8' : ''
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
        <div className='absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/12 transition-colors hover:bg-white/28' />
      </div>

      {open ? (
        <button
          type='button'
          onClick={() => onOpenChange(false)}
          className='absolute left-0 top-1/2 z-40 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/88 text-white/78 shadow-[0_12px_36px_rgba(0,0,0,0.42)] transition hover:border-white/18 hover:bg-black hover:text-white'
          aria-label='收起对话详情'
        >
          <PanelRightClose className='h-4 w-4' />
        </button>
      ) : null}

      <div className='flex h-full min-h-0 min-w-[320px] flex-col bg-[rgba(6,8,12,0.94)]'>
        <AssistantThread open={open} />
        <div className='px-5 pb-5'>
          <Prompt variant='docked' />
        </div>
      </div>
    </div>
  )
}

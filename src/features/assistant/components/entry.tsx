'use client'

import { Prompt } from './prompt'

interface AssistantEntryProps {
  visible: boolean
  onOpen: () => void
}

export function AssistantEntry({ visible, onOpen }: AssistantEntryProps) {
  if (!visible) {
    return null
  }

  return (
    <>
      <Prompt variant='overlay' onSubmitted={onOpen} />
      <AssistantEdgeTrigger onOpen={onOpen} />
    </>
  )
}

function AssistantEdgeTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type='button'
      onClick={onOpen}
      className='group absolute right-0 top-0 z-10 h-full w-6 cursor-pointer bg-transparent'
      aria-label='打开对话详情'
    >
      <span className='absolute inset-y-0 left-3 w-px bg-neutral-500/25 opacity-0 transition-opacity duration-300 group-hover:opacity-90' />
    </button>
  )
}

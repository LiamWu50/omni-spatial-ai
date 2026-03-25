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
      <Prompt variant='overlay' />
      <AssistantEdgeTrigger onOpen={onOpen} />
    </>
  )
}

function AssistantEdgeTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type='button'
      onClick={onOpen}
      className='group absolute right-0 top-0 z-30 h-full w-6 cursor-pointer bg-transparent'
      aria-label='打开对话详情'
    >
      <span className='absolute inset-y-0 left-3 w-px bg-white/0 transition-colors duration-300 group-hover:bg-white/10' />
      <span className='absolute inset-0 bg-white/1 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
    </button>
  )
}

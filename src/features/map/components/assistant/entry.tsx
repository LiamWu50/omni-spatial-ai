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
      <span className='absolute inset-y-0 left-3 w-px bg-transparent transition-colors duration-300 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-800' />
      <span className='absolute inset-0 bg-neutral-900/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-neutral-950/10' />
    </button>
  )
}

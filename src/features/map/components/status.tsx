import type { StatusBarState } from '../types'

interface MapStatusProps {
  state: StatusBarState
}

export function Status({ state }: MapStatusProps) {
  return (
    <footer className='absolute inset-x-0 bottom-0 z-20 flex h-8 items-center justify-between border border-x-0 border-b-0 border-(--module-panel-border) bg-(--module-panel-bg) px-4 text-[10px] leading-none text-neutral-600 shadow-(--module-panel-shadow) backdrop-blur-[20px] dark:text-neutral-300'>
      <div className='flex items-center gap-2 text-[10px] text-(--module-panel-text-muted)'>
        <span className='font-semibold text-neutral-900 dark:text-neutral-50'>OmniSpatial AI</span>
        <span className='h-1 w-1 rounded-full bg-(--module-panel-border)' />
        <span>{state.attribution}</span>
      </div>

      <div className='flex items-center gap-4 text-[10px]'>
        <span>{state.engineLabel}</span>
        <span>{state.scaleLabel}</span>
        <span>{state.cameraLabel}</span>
        <span>{state.coordinateLabel}</span>
        <span>{state.zoomLabel}</span>
      </div>
    </footer>
  )
}

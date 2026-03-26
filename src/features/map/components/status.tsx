import type { StatusBarState } from '../types'

interface MapStatusProps {
  state: StatusBarState
}

export function Status({ state }: MapStatusProps) {
  return (
    <footer className='absolute inset-x-0 bottom-0 z-20 flex h-8 items-center justify-between border-t border-neutral-800 bg-neutral-950/90 px-4 text-[10px] leading-none text-neutral-300 backdrop-blur-xl'>
      <div className='flex items-center gap-2 text-[10px] text-neutral-400'>
        <span className='font-semibold text-neutral-50'>OmniSpatial AI</span>
        <span className='h-1 w-1 rounded-full bg-neutral-300' />
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

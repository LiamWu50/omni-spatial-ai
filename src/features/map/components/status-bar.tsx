import type { StatusBarState } from '../types'

interface MapStatusProps {
  state: StatusBarState
}

export function Status({ state }: MapStatusProps) {
  return (
    <footer className='pointer-events-none absolute w-full bottom-0 z-20 flex h-8 items-center justify-between border-t border-border bg-surface-subtle px-4 text-[10px] leading-none text-text-muted font-body'>
      <div className='flex items-center gap-2 text-[10px] text-text-secondary'>
        <span className='font-bold text-foreground font-display uppercase tracking-[1.4px]'>OmniSpatial AI</span>
        <span className='h-1 w-1 rounded-full bg-border' />
        <span>{state.attribution}</span>
      </div>

      <div className='flex items-center gap-4 text-[10px]'>
        <span>{state.scaleLabel}</span>
        <span>{state.coordinateLabel}</span>
        <span>{state.zoomLabel}</span>
      </div>
    </footer>
  )
}

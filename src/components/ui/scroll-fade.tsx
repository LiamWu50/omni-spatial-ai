'use client'

import type { ReactNode, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type ScrollAxis = 'horizontal' | 'vertical' | 'both'

interface ScrollFadeProps {
  children?: ReactNode
  className?: string
  overlayClassName?: string
  axis?: ScrollAxis
  hideScrollbar?: boolean
  intensity?: number
  background?: string
  containerRef?: RefObject<HTMLElement | null>
}

interface ScrollFadeState {
  showLeft: boolean
  showRight: boolean
  showTop: boolean
  showBottom: boolean
}

const initialFadeState: ScrollFadeState = {
  showLeft: false,
  showRight: false,
  showTop: false,
  showBottom: false
}

function useScrollFadeState(containerRef: RefObject<HTMLElement | null>, axis: ScrollAxis) {
  const [fadeState, setFadeState] = useState<ScrollFadeState>(initialFadeState)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const checkScroll = () => {
      const { clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth } = container

      setFadeState({
        showLeft: (axis === 'horizontal' || axis === 'both') && scrollLeft > 0,
        showRight: (axis === 'horizontal' || axis === 'both') && Math.ceil(scrollLeft + clientWidth) < scrollWidth,
        showTop: (axis === 'vertical' || axis === 'both') && scrollTop > 0,
        showBottom: (axis === 'vertical' || axis === 'both') && Math.ceil(scrollTop + clientHeight) < scrollHeight
      })
    }

    checkScroll()

    container.addEventListener('scroll', checkScroll, { passive: true })

    const resizeObserver = new ResizeObserver(checkScroll)
    resizeObserver.observe(container)

    const content = container.firstElementChild
    if (content instanceof HTMLElement) {
      resizeObserver.observe(content)
    }

    return () => {
      container.removeEventListener('scroll', checkScroll)
      resizeObserver.disconnect()
    }
  }, [axis, containerRef])

  return fadeState
}

function ScrollFadeOverlays({
  axis,
  background,
  intensity,
  overlayClassName,
  showBottom,
  showLeft,
  showRight,
  showTop
}: ScrollFadeState & {
  axis: ScrollAxis
  background: string
  intensity: number
  overlayClassName?: string
}) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 z-10', overlayClassName)}>
      {(axis === 'horizontal' || axis === 'both') && showLeft ? (
        <div
          aria-hidden
          className='absolute left-0 top-0 h-full w-10'
          style={{
            opacity: intensity,
            background: `linear-gradient(to right, ${background}, transparent)`
          }}
        />
      ) : null}

      {(axis === 'horizontal' || axis === 'both') && showRight ? (
        <div
          aria-hidden
          className='absolute right-0 top-0 h-full w-10'
          style={{
            opacity: intensity,
            background: `linear-gradient(to left, ${background}, transparent)`
          }}
        />
      ) : null}

      {(axis === 'vertical' || axis === 'both') && showTop ? (
        <div
          aria-hidden
          className='absolute left-0 top-0 h-10 w-full'
          style={{
            opacity: intensity,
            background: `linear-gradient(to bottom, ${background}, transparent)`
          }}
        />
      ) : null}

      {(axis === 'vertical' || axis === 'both') && showBottom ? (
        <div
          aria-hidden
          className='absolute bottom-0 left-0 h-10 w-full'
          style={{
            opacity: intensity,
            background: `linear-gradient(to top, ${background}, transparent)`
          }}
        />
      ) : null}
    </div>
  )
}

export default function ScrollFade({
  children,
  className,
  overlayClassName,
  axis = 'horizontal',
  hideScrollbar = true,
  intensity = 1,
  background = 'var(--module-panel-bg-solid, var(--background, #ffffff))',
  containerRef
}: ScrollFadeProps) {
  const internalRef = useRef<HTMLDivElement | null>(null)
  const targetRef = containerRef ?? internalRef
  const { showBottom, showLeft, showRight, showTop } = useScrollFadeState(targetRef, axis)
  const fadeIntensity = Math.min(Math.max(intensity, 0), 1)

  if (containerRef) {
    return (
      <ScrollFadeOverlays
        axis={axis}
        background={background}
        intensity={fadeIntensity}
        overlayClassName={overlayClassName}
        showBottom={showBottom}
        showLeft={showLeft}
        showRight={showRight}
        showTop={showTop}
      />
    )
  }

  return (
    <div className='relative min-h-0 min-w-0'>
      <div
        ref={internalRef}
        className={cn(
          'min-h-0 min-w-0',
          hideScrollbar && '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          axis === 'horizontal' && 'w-full overflow-x-auto overflow-y-hidden',
          axis === 'vertical' && 'h-full overflow-x-hidden overflow-y-auto',
          axis === 'both' && 'overflow-auto',
          className
        )}
      >
        <div
          className={cn(
            axis === 'horizontal' && 'min-w-full w-fit',
            axis === 'vertical' && 'min-h-full h-fit',
            axis === 'both' && 'min-h-full min-w-full h-fit w-fit'
          )}
        >
          {children}
        </div>
      </div>

      <ScrollFadeOverlays
        axis={axis}
        background={background}
        intensity={fadeIntensity}
        overlayClassName={overlayClassName}
        showBottom={showBottom}
        showLeft={showLeft}
        showRight={showRight}
        showTop={showTop}
      />
    </div>
  )
}

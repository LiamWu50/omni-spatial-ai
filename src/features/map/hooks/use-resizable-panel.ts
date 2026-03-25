'use client'

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useState } from 'react'

interface UseResizablePanelOptions {
  defaultWidth: number
  defaultWidthRatio: number
  minWidth: number
  maxWidthRatio: number
}

function getMaxWidth(viewportWidth: number, minWidth: number, maxWidthRatio: number) {
  return Math.max(minWidth, Math.round(viewportWidth * maxWidthRatio))
}

function clampWidth(nextWidth: number, viewportWidth: number, { maxWidthRatio, minWidth }: UseResizablePanelOptions) {
  return Math.min(Math.max(nextWidth, minWidth), getMaxWidth(viewportWidth, minWidth, maxWidthRatio))
}

export function useResizablePanel(options: UseResizablePanelOptions) {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') {
      return options.defaultWidth
    }

    const preferred = Math.round(window.innerWidth * options.defaultWidthRatio)
    const initialWidth = Math.min(options.defaultWidth, preferred)
    return clampWidth(initialWidth, window.innerWidth, options)
  })
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const syncWidth = () => {
      setWidth((current) => clampWidth(current, window.innerWidth, options))
    }

    syncWidth()
    window.addEventListener('resize', syncWidth)
    return () => window.removeEventListener('resize', syncWidth)
  }, [options])

  useEffect(() => {
    if (!isResizing) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      setWidth(clampWidth(window.innerWidth - event.clientX, window.innerWidth, options))
    }

    const handlePointerUp = () => {
      setIsResizing(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isResizing, options])

  const startResize = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault()
    setIsResizing(true)
  }, [])

  return {
    isResizing,
    startResize,
    width
  }
}

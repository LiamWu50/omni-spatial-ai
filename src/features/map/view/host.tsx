'use client'

import { useEffect, useRef } from 'react'

import { mapBridge } from '../bridge/map'

export function MapHost() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    return mapBridge.mount(container)
  }, [])

  return <div ref={containerRef} className='pointer-events-none absolute inset-0 opacity-0' />
}

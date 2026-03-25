'use client'

import { useRef } from 'react'

import { useMapRuntime } from '../hooks/use-map-runtime'

export function Host() {
  const containerRef = useRef<HTMLDivElement>(null)

  useMapRuntime(containerRef)

  return <div ref={containerRef} className='pointer-events-none absolute inset-0 opacity-0' />
}

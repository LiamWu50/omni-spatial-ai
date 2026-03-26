import type { BaseLayerType } from '../types'

interface MapSceneProps {
  activeBaseLayer: BaseLayerType
}

export function Scene({ activeBaseLayer }: MapSceneProps) {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 z-[1] transition-colors duration-500 ${
          activeBaseLayer === 'satellite'
            ? 'bg-[radial-gradient(circle_at_50%_16%,rgba(14,165,233,0.18),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.42)_100%)]'
            : activeBaseLayer === 'terrain'
              ? 'bg-[radial-gradient(circle_at_55%_18%,rgba(74,222,128,0.15),transparent_20%),linear-gradient(180deg,rgba(3,7,18,0.1)_0%,rgba(3,7,18,0.36)_100%)]'
              : 'bg-[radial-gradient(circle_at_50%_18%,rgba(96,165,250,0.16),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.28)_100%)]'
        }`}
      />

      <div className='pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-15 [mask-image:radial-gradient(circle_at_center,rgba(255,255,255,0.5),transparent_78%)]' />
      <div className='pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_52%_44%,rgba(59,130,246,0.08),transparent_24%)]' />
    </>
  )
}

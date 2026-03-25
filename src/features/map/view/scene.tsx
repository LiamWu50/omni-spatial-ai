import type { BaseLayerType } from '../types'

interface SceneProps {
  activeBaseLayer: BaseLayerType
}

export function Scene({ activeBaseLayer }: SceneProps) {
  return (
    <>
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          activeBaseLayer === 'satellite'
            ? 'bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_30%_20%,rgba(15,118,110,0.22),transparent_20%),linear-gradient(180deg,#030711_0%,#000000_100%)]'
            : activeBaseLayer === 'terrain'
              ? 'bg-[radial-gradient(circle_at_55%_26%,rgba(56,189,248,0.16),transparent_24%),radial-gradient(circle_at_42%_32%,rgba(245,158,11,0.12),transparent_22%),linear-gradient(180deg,#060a12_0%,#000000_100%)]'
              : 'bg-[radial-gradient(circle_at_50%_24%,rgba(125,211,252,0.12),transparent_20%),linear-gradient(180deg,#04070d_0%,#000000_100%)]'
        }`}
      />

      <div className='earth-grid absolute inset-0 opacity-40' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(59,130,246,0.14),transparent_24%)]' />

      <div className='pointer-events-none absolute left-1/2 top-[15%] h-[72vh] w-[72vh] max-h-[860px] max-w-[860px] -translate-x-[8%]'>
        <div className='earth-orbit absolute inset-0' />
        <div
          className={`earth-globe absolute inset-[8%] ${
            activeBaseLayer === 'terrain'
              ? 'earth-globe--terrain'
              : activeBaseLayer === 'vector'
                ? 'earth-globe--vector'
                : ''
          }`}
        />
        <div className='earth-shadow absolute inset-[7%] translate-x-[16%] translate-y-[9%]' />
      </div>
    </>
  )
}

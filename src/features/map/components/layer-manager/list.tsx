'use client'

import { Item } from './item'
import type { LayerManagerActions, LayerManagerData } from './types'

interface ListProps {
  data: Pick<LayerManagerData, 'layers'>
  actions: Pick<LayerManagerActions, 'onToggleLayer' | 'onFocusLayer' | 'onRemoveLayer'>
}

export function List({ actions, data }: ListProps) {
  const { layers } = data
  const visibleLayerCount = layers.filter((layer) => layer.visible).length

  return (
    <section>
      <div className='mb-3 flex items-center justify-between'>
        <div className='text-sm font-semibold text-neutral-900 dark:text-neutral-50'>图层列表</div>
        <div className='text-xs text-(--module-panel-text-muted)'>
          {visibleLayerCount}/{layers.length} 可见
        </div>
      </div>
      <div className='space-y-2'>
        {layers.map((layer) => (
          <Item
            key={layer.id}
            layer={layer}
            onFocusLayer={actions.onFocusLayer}
            onRemoveLayer={actions.onRemoveLayer}
            onToggleLayer={actions.onToggleLayer}
          />
        ))}
      </div>
    </section>
  )
}

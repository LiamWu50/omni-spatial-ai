import type { UserLayerListItem } from '../../types'

export interface LayerManagerData {
  layers: UserLayerListItem[]
}

export interface LayerManagerActions {
  onToggle: () => void
  onToggleLayer: (layerId: string) => Promise<void> | void
  onFocusLayer: (layerId: string) => Promise<void> | void
  onRemoveLayer: (layerId: string) => Promise<void> | void
}

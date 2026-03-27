import type { UserLayerListItem } from '../../types'

export interface LayerManagerData {
  importStatus: string
  layers: UserLayerListItem[]
}

export interface LayerManagerActions {
  onToggle: () => void
  onImportLayers: (files: File[]) => Promise<void> | void
  onToggleLayer: (layerId: string) => Promise<void> | void
  onFocusLayer: (layerId: string) => Promise<void> | void
  onRemoveLayer: (layerId: string) => Promise<void> | void
}

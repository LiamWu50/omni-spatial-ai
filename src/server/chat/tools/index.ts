import { createMapLayerLoadTool } from './map-layer-load'
import { createMapLayerStyleTool } from './map-layer-style'
import { createMapViewControlTool } from './map-view-control'
import { createDefaultGeocoder, createDefaultSystemDatasetLoader, type CreateMapAssistantToolsOptions } from './shared'

/**
 * 创建地图助手工具集合。
 */
export function createMapAssistantTools(options: CreateMapAssistantToolsOptions = {}) {
  const fetchImpl = options.fetch ?? fetch
  const geocoder = options.geocoder ?? createDefaultGeocoder(fetchImpl)
  const systemDatasetLoader = options.systemDatasetLoader ?? createDefaultSystemDatasetLoader(fetchImpl)

  return {
    map_view_control: createMapViewControlTool(geocoder),
    map_layer_load: createMapLayerLoadTool(fetchImpl, systemDatasetLoader),
    map_layer_style: createMapLayerStyleTool()
  }
}

export type { CreateMapAssistantToolsOptions, GeocoderAdapter, GeocodeResult, SystemDatasetLoader } from './shared'

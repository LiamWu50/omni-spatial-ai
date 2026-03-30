import type { ActionSource, BaseMapDescriptor } from './schema'

export function createActionMeta(source: ActionSource) {
  return {
    source,
    schemaVersion: '1.0.0',
    replayable: true,
    timestamp: new Date().toISOString()
  }
}

export function defaultBaseMaps(): Record<string, BaseMapDescriptor> {
  return {
    streets: {
      id: 'streets',
      name: 'CARTO Dark',
      provider: 'osm',
      imageryUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      note: '默认暗黑底图，适用于 Leaflet 2D 视图'
    },
    imagery: {
      id: 'imagery',
      name: '天地图影像',
      provider: 'tianditu',
      imageryUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      note: '无密钥影像瓦片兜底'
    },
    light: {
      id: 'light',
      name: 'OpenStreetMap Light',
      provider: 'osm',
      imageryUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      note: '浅色矢量底图'
    }
  }
}

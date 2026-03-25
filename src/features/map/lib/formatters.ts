import type { BaseLayerType } from '../types'

export function formatCoordinate(lng: number, lat: number) {
  return `${lat.toFixed(5)}°N ${lng.toFixed(5)}°E`
}

export function formatScale(zoom: number) {
  if (zoom >= 10) return '100 公里'
  if (zoom >= 8) return '300 公里'
  if (zoom >= 6) return '1,000 公里'
  if (zoom >= 4) return '3,000 公里'
  return '5,000 公里'
}

export function formatAttribution(activeBaseLayer: BaseLayerType) {
  const sceneLabel =
    activeBaseLayer === 'satellite' ? '影像场景' : activeBaseLayer === 'terrain' ? '地形场景' : '矢量场景'

  return `OmniSpatial AI · ${sceneLabel} · 数据归因`
}

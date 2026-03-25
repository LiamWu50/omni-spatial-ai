import { createActionMeta, defaultBaseMaps, type GisAction } from '@/lib/gis/schema'

export interface SpatialAgentDraft {
  reply: string
  actions: GisAction[]
}

const locationLookup: Record<string, { lng: number; lat: number }> = {
  北京: { lng: 116.397389, lat: 39.908722 },
  上海: { lng: 121.473701, lat: 31.230416 },
  杭州: { lng: 120.15507, lat: 30.274084 },
  深圳: { lng: 114.057868, lat: 22.543099 },
  广州: { lng: 113.264385, lat: 23.129112 }
}

function resolveLocation(text: string) {
  return Object.entries(locationLookup).find(([name]) => text.includes(name))
}

export function createMockIntent(prompt: string): SpatialAgentDraft {
  const baseMaps = defaultBaseMaps()
  const actions: GisAction[] = []
  const location = resolveLocation(prompt)

  if (location) {
    actions.push({
      type: 'MOVE_TO',
      payload: {
        center: location[1],
        zoom: 11
      },
      meta: createActionMeta('ai')
    })
  }

  if (prompt.includes('天地图') || prompt.includes('影像')) {
    actions.push({
      type: 'SWITCH_BASEMAP',
      payload: {
        baseMap: baseMaps.imagery
      },
      meta: createActionMeta('ai')
    })
  }

  if (prompt.includes('浅色') || prompt.includes('light')) {
    actions.push({
      type: 'SWITCH_BASEMAP',
      payload: {
        baseMap: baseMaps.light
      },
      meta: createActionMeta('ai')
    })
  }

  const layerKeyword = prompt.match(/加载(.+?)(图层|数据)/)
  if (layerKeyword) {
    const layerName = layerKeyword[1].trim()
    actions.push({
      type: 'ADD_LAYER',
      payload: {
        layer: {
          id: `mock-${Date.now()}`,
          name: layerName,
          sourceType: 'geojson',
          geometryType: 'point',
          visible: true,
          crs: 'WGS84',
          style: {
            color: '#60a5fa',
            radius: 6
          },
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  name: layerName
                },
                geometry: {
                  type: 'Point',
                  coordinates: [location?.[1].lng ?? 121.473701, location?.[1].lat ?? 31.230416]
                }
              }
            ]
          }
        }
      },
      meta: createActionMeta('ai')
    })
  }

  if (prompt.includes('缓冲') || prompt.includes('buffer')) {
    actions.push({
      type: 'CALC_BUFFER',
      payload: {
        layerId: 'uploaded-layer',
        distance: 500,
        units: 'meters',
        targetLayerId: `buffer-${Date.now()}`
      },
      meta: createActionMeta('ai')
    })
  }

  return {
    reply:
      actions.length > 0
        ? '已解析为空间动作，并同步推送到地图控制器。'
        : '我暂未识别出明确地图动作，已保留原始对话内容。',
    actions
  }
}

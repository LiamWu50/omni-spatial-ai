import { PencilRuler, Ruler } from 'lucide-react'

import type { BaseMapOption, LayerToggleItem, QuickLocation, ShellPanelState, ShellToolbarAction } from '../types'

export const INITIAL_PANEL_STATE: ShellPanelState = {
  layerManagerOpen: true,
  searchOpen: false,
  layerListOpen: true,
  assistantPanelOpen: false
}

export const INITIAL_LAYER_ITEMS: LayerToggleItem[] = [
  { id: 'bridge-monitor', name: '桥梁监测', visible: true, description: '主桥梁、匝道与控制点' },
  { id: 'slope-monitor', name: '边坡监测', visible: true, description: '滑坡体、位移桩与风险区' },
  { id: 'settlement-monitor', name: '沉降监测', visible: false, description: '路基与站点沉降监测' }
]

export const QUICK_LOCATIONS: QuickLocation[] = [
  { id: 'beijing', label: '北京城区', center: { lng: 116.39745, lat: 39.90918 }, zoom: 8.6 },
  { id: 'xian', label: '西安走廊', center: { lng: 108.93977, lat: 34.34157 }, zoom: 7.9 },
  { id: 'yanan', label: '延榆六标', center: { lng: 109.49027, lat: 36.58546 }, zoom: 9.4 }
]

export const BASE_MAP_OPTIONS: BaseMapOption[] = [
  {
    key: 'satellite',
    label: '影像',
    previewClassName: 'bg-[linear-gradient(135deg,#86efac_0%,#38bdf8_42%,#1d4ed8_100%)]'
  },
  {
    key: 'terrain',
    label: '地形',
    previewClassName: 'bg-[linear-gradient(135deg,#d9f99d_0%,#86efac_26%,#7dd3fc_56%,#cbd5e1_100%)]'
  },
  {
    key: 'vector',
    label: '矢量',
    previewClassName: 'bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_34%,#93c5fd_62%,#2563eb_100%)]'
  }
]

export const TOOLBAR_ACTIONS: Array<Omit<ShellToolbarAction, 'active'>> = [
  {
    id: 'measure',
    label: '测量工具',
    shortLabel: '测量',
    icon: Ruler,
    group: 'data'
  },
  {
    id: 'draw',
    label: '绘制工具',
    shortLabel: '绘制',
    icon: PencilRuler,
    group: 'data'
  }
]

export const ASSISTANT_PANEL_DEFAULTS = {
  defaultWidth: 420,
  defaultWidthRatio: 0.34,
  minWidth: 320,
  maxWidthRatio: 0.4
} as const

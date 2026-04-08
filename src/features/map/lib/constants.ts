import { LineSquiggle, MapPin, Ruler } from 'lucide-react'

import type { BaseMapOption, ShellPanelState, ShellToolbarAction } from '../types'

export const INITIAL_PANEL_STATE: ShellPanelState = {
  layerManagerOpen: true,
  assistantPanelOpen: false
}

export const USER_LAYER_ID_PREFIX = 'user-layer-'
export const MEASURE_LAYER_ID_PREFIX = 'measure-layer-'
export const DRAW_LAYER_ID_PREFIX = 'draw-layer-'
export const LAYER_UPLOAD_ACCEPT = '.geojson,.json'
export const LAYER_UPLOAD_MAX_SIZE_MB = 100

export const BASE_MAP_OPTIONS: BaseMapOption[] = [
  {
    key: 'light',
    label: '浅色模式',
    previewClassName: 'bg-[linear-gradient(135deg,#d9f99d_0%,#86efac_26%,#7dd3fc_56%,#cbd5e1_100%)]'
  },
  {
    key: 'dark',
    label: '深色模式',
    previewClassName: 'bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_34%,#93c5fd_62%,#2563eb_100%)]'
  }
]

export const TOOLBAR_ACTIONS = [
  {
    id: 'measure',
    label: '测量',
    shortLabel: '测量',
    icon: Ruler,
    group: 'data'
  },
  {
    id: 'point',
    label: '添加点位',
    shortLabel: '点位',
    icon: MapPin,
    group: 'data'
  },
  {
    id: 'geometry',
    label: '添加线 / 多边形',
    shortLabel: '线/面',
    icon: LineSquiggle,
    group: 'data'
  }
] satisfies Array<Omit<ShellToolbarAction, 'active'>>

export const ASSISTANT_PANEL_DEFAULTS = {
  defaultWidth: 380,
  defaultWidthRatio: 0.34,
  minWidth: 320,
  maxWidthRatio: 0.4
} as const

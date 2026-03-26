import {
  type BaseMapDescriptor,
  defaultBaseMaps,
  type EngineType,
  type GisAction,
  type LayerDescriptor,
  layerDescriptorSchema,
  type MapViewState,
  mapViewStateSchema,
  parseGisAction
} from '@/lib/gis/schema'
import type { IMapEngine } from '@/lib/map/engines'
import { UnsupportedActionError } from '@/lib/map/errors'
import { MapRuntimeStore } from '@/lib/map/store'

export type ActionMiddleware = (
  action: GisAction,
  controller: MapController
) => Promise<GisAction | GisAction[] | null> | GisAction | GisAction[] | null

export interface MapControllerOptions {
  engines: Record<EngineType, IMapEngine>
  initialEngine?: EngineType
  initialView?: Partial<MapViewState>
  initialBaseMap?: BaseMapDescriptor
  middleware?: ActionMiddleware[]
}

export class MapController {
  private readonly engines: Record<EngineType, IMapEngine>

  private activeEngineType: EngineType

  private activeEngine: IMapEngine

  private container: HTMLElement | null = null

  private engineUnsubscribers: Array<() => void> = []

  readonly store: MapRuntimeStore

  private middleware: ActionMiddleware[]

  constructor(options: MapControllerOptions) {
    const initialEngine = options.initialEngine ?? 'mapbox'
    const initialView = mapViewStateSchema.parse({
      ...options.initialView
    })
    const initialBaseMap = options.initialBaseMap ?? defaultBaseMaps().streets

    this.engines = options.engines
    this.activeEngineType = initialEngine
    this.activeEngine = options.engines[initialEngine]
    this.middleware = options.middleware ?? []
    this.store = new MapRuntimeStore({
      activeEngine: initialEngine,
      view: initialView,
      layers: [],
      baseMap: initialBaseMap,
      lastError: null
    })
  }

  async mount(container: HTMLElement) {
    this.container = container
    await this.activeEngine.mount(container, {
      initialView: this.store.getState().view,
      baseMap: this.store.getState().baseMap ?? undefined
    })
    this.bindEngineEvents(this.activeEngine)
  }

  async unmount() {
    await this.activeEngine.unmount()
    this.engineUnsubscribers.forEach((unsubscribe) => unsubscribe())
    this.engineUnsubscribers = []
    this.container = null
  }

  getActiveEngineType(): EngineType {
    return this.activeEngineType
  }

  getLayers(): LayerDescriptor[] {
    return this.store.getState().layers
  }

  getView(): MapViewState {
    return this.store.getState().view
  }

  async switchEngine(nextEngine: EngineType) {
    if (nextEngine === this.activeEngineType) {
      return
    }
    if (!this.container) {
      throw new Error('MapController 尚未挂载')
    }

    const snapshot = this.activeEngine.getView()
    const layers = this.store.getState().layers
    const baseMap = this.store.getState().baseMap ?? defaultBaseMaps().streets

    await this.activeEngine.unmount()

    this.activeEngineType = nextEngine
    this.activeEngine = this.engines[nextEngine]

    await this.activeEngine.mount(this.container, {
      initialView: snapshot,
      baseMap
    })

    this.bindEngineEvents(this.activeEngine)

    for (const layer of layers) {
      await this.activeEngine.addLayer(layer)
    }

    this.store.setState({
      activeEngine: nextEngine,
      view: snapshot,
      baseMap,
      layers
    })
  }

  async dispatch(input: GisAction) {
    const action = parseGisAction(input)
    const normalized = await this.runMiddleware(action)
    if (!normalized.length) {
      return
    }
    for (const nextAction of normalized) {
      await this.applyAction(nextAction)
    }
  }

  private async runMiddleware(action: GisAction): Promise<GisAction[]> {
    let queue: GisAction[] = [action]

    for (const middleware of this.middleware) {
      const nextQueue: GisAction[] = []

      for (const item of queue) {
        const result = await middleware(item, this)
        if (result === null) {
          continue
        }
        if (Array.isArray(result)) {
          nextQueue.push(...result)
        } else {
          nextQueue.push(result)
        }
      }

      queue = nextQueue
    }

    return queue
  }

  private async applyAction(action: GisAction) {
    try {
      switch (action.type) {
        case 'MOVE_TO': {
          const view = {
            ...this.store.getState().view,
            ...action.payload
          }
          await this.activeEngine.setView(view)
          this.store.setState({ view })
          return
        }
        case 'SET_ZOOM': {
          const view = {
            ...this.store.getState().view,
            zoom: action.payload.zoom
          }
          await this.activeEngine.setView(view)
          this.store.setState({ view })
          return
        }
        case 'FIT_BOUNDS': {
          await this.activeEngine.fitBounds(action.payload.bounds, action.payload.options)
          this.store.setState({
            view: this.activeEngine.getView()
          })
          return
        }
        case 'SWITCH_BASEMAP': {
          await this.activeEngine.setBaseMap(action.payload.baseMap)
          this.store.setState({
            baseMap: action.payload.baseMap
          })
          return
        }
        case 'ADD_LAYER': {
          await this.activeEngine.addLayer(action.payload.layer)
          const layers = this.upsertLayer(action.payload.layer)
          this.store.setState({ layers })
          return
        }
        case 'UPDATE_LAYER': {
          await this.activeEngine.updateLayer(action.payload.layer)
          const layers = this.upsertLayer(action.payload.layer)
          this.store.setState({ layers })
          return
        }
        case 'SET_LAYER_STYLE': {
          const current = this.store.getState().layers.find((layer) => layer.id === action.payload.layerId)
          if (!current) {
            return
          }
          const nextLayer = layerDescriptorSchema.parse({
            ...current,
            style: {
              ...current.style,
              ...action.payload.style
            }
          })
          await this.activeEngine.updateLayer(nextLayer)
          this.store.setState({
            layers: this.upsertLayer(nextLayer)
          })
          return
        }
        case 'REMOVE_LAYER': {
          await this.activeEngine.removeLayer(action.payload.layerId)
          this.store.setState({
            layers: this.store.getState().layers.filter((layer) => layer.id !== action.payload.layerId)
          })
          return
        }
        case 'QUERY_LAYER': {
          await this.activeEngine.highlightFeature(action.payload.query)
          return
        }
        case 'CALC_BUFFER': {
          return
        }
        default: {
          throw new UnsupportedActionError('UNKNOWN')
        }
      }
    } catch (error) {
      this.store.setState({
        lastError: error instanceof Error ? error.message : '未知地图错误'
      })
      throw error
    }
  }

  private bindEngineEvents(engine: IMapEngine) {
    this.engineUnsubscribers.forEach((unsubscribe) => unsubscribe())
    this.engineUnsubscribers = [
      engine.on('viewChange', (view) => {
        this.store.setState({ view })
      }),
      engine.on('layerChange', ({ layers }) => {
        this.store.setState({ layers })
      })
    ]
  }

  private upsertLayer(layer: LayerDescriptor) {
    const next = new Map(this.store.getState().layers.map((item) => [item.id, item] as const))
    next.set(layer.id, layer)
    return [...next.values()]
  }
}

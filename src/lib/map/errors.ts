export class MapEngineError extends Error {
  constructor(
    message: string,
    readonly code = 'MAP_ENGINE_ERROR',
    readonly cause?: unknown
  ) {
    super(message)
    this.name = 'MapEngineError'
  }
}

export class UnsupportedActionError extends Error {
  constructor(actionType: string) {
    super(`暂不支持的地图动作: ${actionType}`)
    this.name = 'UnsupportedActionError'
  }
}

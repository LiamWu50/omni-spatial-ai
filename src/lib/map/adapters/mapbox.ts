import { BaseDomMapEngine } from './base'

export class MapboxAdapter extends BaseDomMapEngine {
  constructor() {
    super('mapbox')
  }

  protected getBackground(): string {
    return 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)'
  }

  protected getTitle(): string {
    return 'Mapbox GL JS'
  }
}

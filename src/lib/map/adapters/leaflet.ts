import { BaseDomMapEngine } from './base'

export class LeafletAdapter extends BaseDomMapEngine {
  constructor() {
    super('leaflet')
  }

  protected getBackground(): string {
    return 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)'
  }

  protected getTitle(): string {
    return 'Leaflet Lightweight'
  }
}

import { BaseDomMapEngine } from './base'

export class CesiumAdapter extends BaseDomMapEngine {
  constructor() {
    super('cesium')
  }

  protected getBackground(): string {
    return 'linear-gradient(135deg, #111827 0%, #7c3aed 100%)'
  }

  protected getTitle(): string {
    return 'Cesium 3D Globe'
  }
}

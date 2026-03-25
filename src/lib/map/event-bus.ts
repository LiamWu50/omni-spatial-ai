import type { GisAction, Unsubscribe } from '@/lib/gis/schema'

type ActionListener = (action: GisAction) => void | Promise<void>

export class ActionBus {
  private listeners = new Set<ActionListener>()

  async emit(action: GisAction) {
    for (const listener of this.listeners) {
      await listener(action)
    }
  }

  async emitMany(actions: GisAction[]) {
    for (const action of actions) {
      await this.emit(action)
    }
  }

  subscribe(listener: ActionListener): Unsubscribe {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const actionBus = new ActionBus()

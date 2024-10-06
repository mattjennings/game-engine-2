export class EventEmitter<
  Events extends Record<string, any> = Record<string, any>,
> {
  listeners: Partial<Record<keyof Events, Array<Function>>> = {}

  on<K extends keyof Events>(event: K, listener: (payload: Events[K]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event]!.push(listener)
  }

  off<K extends keyof Events>(
    event: K,
    listener: (payload: Events[K]) => void,
  ) {
    if (!this.listeners[event]) {
      return
    }

    this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener)
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    if (!this.listeners[event]) {
      return
    }

    this.listeners[event]!.forEach((listener) => {
      listener(payload)
    })
  }
}

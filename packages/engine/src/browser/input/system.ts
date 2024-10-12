import { Entity, System } from '../../core'
import { TickEvent } from '../../core/engine/clock'
import { $Input } from './component'

export class InputSystem extends System {
  keys = new Map<string, 'pressed' | 'held' | 'released' | null>()

  constructor() {
    super()
  }

  init(): Promise<void> {
    $Input.init()
    return super.init()
  }

  update(event: TickEvent, entities: Set<Entity>): void {
    $Input.update()
  }
}

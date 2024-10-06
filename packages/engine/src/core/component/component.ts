import { Entity, UpdateEvent } from '../entity'
import { EventEmitter } from '../events/event-emitter'

export class Component extends EventEmitter {
  entity: Entity | null = null

  onAdd(entity: Entity) {}
  onRemove(entity: Entity) {}

  onUpdate(ev: UpdateEvent) {}
  onPostUpdate(ev: UpdateEvent) {}
}

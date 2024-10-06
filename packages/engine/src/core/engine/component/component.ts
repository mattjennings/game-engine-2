import { Entity, UpdateEvent } from '../entity'
import { EventEmitter } from '../events'

export class Component extends EventEmitter {
  entity!: Entity

  onAdd(entity: Entity) {}
  onRemove(entity: Entity) {}

  onUpdate(ev: UpdateEvent) {}
  onPostUpdate(ev: UpdateEvent) {}
}

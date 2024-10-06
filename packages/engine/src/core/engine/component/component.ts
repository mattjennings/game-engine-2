import { Entity, UpdateEvent } from '../entity'
import { EventEmitter } from '../events'

export class Component extends EventEmitter {
  entity: Entity

  constructor(entity: Entity) {
    super()
    this.entity = entity
    entity.components.add(this)
  }

  onAdd(entity: Entity) {}
  onRemove(entity: Entity) {}

  onUpdate(ev: UpdateEvent) {}
  onPostUpdate(ev: UpdateEvent) {}
}

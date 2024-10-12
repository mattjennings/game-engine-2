import { Entity, UpdateEvent } from '../entity'
import { EventEmitter } from '../events'
import { System } from '../system'

export class Component<S extends System = any> extends EventEmitter {
  entity: Entity
  system?: S

  constructor(entity: Entity) {
    super()
    this.entity = entity
    entity.components.add(this)
  }

  onRemove(entity: Entity) {}

  onPreUpdate(ev: UpdateEvent) {}
  onUpdate(ev: UpdateEvent) {}
  onPostUpdate(ev: UpdateEvent) {}
}

import { Engine } from 'game-engine'
import { Entity } from '../entity'
import { EventEmitter } from '../events'

export class Scene extends EventEmitter<{
  entityadd: Entity
  entityremove: Entity
}> {
  engine!: Engine<any>
  entities: Set<Entity> = new Set()

  addEntity(entity: Entity) {
    entity.scene = this
    entity.onAdd(this)
    entity.emit('add', this)

    this.emit('entityadd', entity)
    this.entities.add(entity)
  }

  removeEntity(entity: Entity, destroy = false) {
    delete entity.scene

    if (destroy) {
      entity.destroy()
    }
    entity.onRemove(this)

    this.emit('entityremove', entity)
    this.entities.delete(entity)
  }

  onStart() {}
}

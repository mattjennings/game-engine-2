import { Engine } from '../engine'
import { Entity } from '../entity'
import { EventEmitter } from '../events'

export class Scene extends EventEmitter<{
  entityadd: Entity
  entityremove: Entity
}> {
  engine: Engine
  entities: Set<Entity> = new Set()

  constructor(engine: Engine) {
    super()
    this.engine = engine
  }

  addEntity(entity: Entity) {
    entity.scene = this
    entity.engine = this.engine
    entity.onAdd(this)
    entity.emit('add', this)

    this.emit('entityadd', entity)
    this.entities.add(entity)
    this.engine.systems.invalidateQueries()
  }

  removeEntity(entity: Entity, destroy = false) {
    delete entity.scene
    delete entity.engine

    if (destroy) {
      entity.destroy()
    }
    entity.onRemove(this)

    this.emit('entityremove', entity)
    this.entities.delete(entity)
    this.engine.systems.invalidateQueries()
  }

  onStart() {}
}

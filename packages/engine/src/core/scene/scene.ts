import { Engine } from '../engine'
import { Entity } from '../entity/entity'
import { EventEmitter } from '../events/event-emitter'

export class Scene extends EventEmitter<{
  entityadded: Entity
  entityremoved: Entity
}> {
  private _engine!: Engine
  entities: Set<Entity> = new Set()

  get engine() {
    if (!this._engine) {
      throw new Error(
        "'engine' not found on Scene. Was it added to the Engine?",
      )
    }

    return this._engine
  }

  addEntity(entity: Entity) {
    entity.scene = this
    entity.engine = this.engine
    entity.onAdd(this)
    entity.emit('added', this)

    this.emit('entityadded', entity)
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

    this.emit('entityremoved', entity)
    this.entities.delete(entity)
    this.engine.systems.invalidateQueries()
  }

  onStart() {}
}

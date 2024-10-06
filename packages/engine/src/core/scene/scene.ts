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
    this.entities.add(entity)
    entity.scene = this
    entity.engine = this.engine
    entity.onAdd(this)

    this.engine.systems.invalidateQueries()
    this.emit('entityadded', entity)
  }

  removeEntity(entity: Entity) {
    entity.onRemove(this)
    this.entities.delete(entity)
    this.engine.systems.invalidateQueries()
    this.emit('entityremoved', entity)
  }

  onStart() {}
}

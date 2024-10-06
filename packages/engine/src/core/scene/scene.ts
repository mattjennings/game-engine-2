import { Engine } from '../engine'
import { Entity } from '../entity/entity'
import { EventEmitter } from '../events/event-emitter'

export class Scene extends EventEmitter {
  private _engine!: Engine

  entities: Set<Entity> = new Set()

  constructor() {
    super()
  }

  init(engine: Engine) {
    this._engine = engine
  }

  get engine() {
    if (!this._engine) {
      throw new Error('engine not found on Scene. Was it added to the Engine?')
    }

    return this._engine
  }

  addEntity(entity: Entity) {
    this.entities.add(entity)
  }

  removeEntity(entity: Entity) {
    entity.onRemove()
    this.entities.delete(entity)
  }
}

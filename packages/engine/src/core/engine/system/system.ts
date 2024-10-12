import { Engine } from '../engine'
import { TickEvent } from '../clock'
import { Entity } from '../entity'
import { EventEmitter } from '../events'
import { SystemQuery } from './system-query'

export class System extends EventEmitter<{
  entityadded: Entity
  entityremoved: Entity
}> {
  static priority: number
  engine!: Engine

  query = new SystemQuery([])

  async init() {
    this.query.on('entityadded', this.onEntityAdded)
    this.query.on('entityremoved', this.onEntityRemoved)
  }

  update(event: TickEvent, entities: Set<Entity>) {}

  onEntityAdded = (entity: Entity) => {}
  onEntityRemoved = (entity: Entity) => {}
}

import { Engine } from '../engine'
import { TickEvent } from '../clock'
import { Entity } from '../entity'
import { EventEmitter } from '../events'
import { SystemQuery } from './system-query'

export class System extends EventEmitter<{
  entityadd: Entity
  entityremoved: Entity
}> {
  static priority: number
  engine!: Engine

  query = new SystemQuery([])

  async init() {
    this.query.on('entityadd', this.onEntityAdd)
    this.query.on('entityremoved', this.onEntityRemove)
  }

  update(event: TickEvent, entities: Set<Entity>) {}

  onEntityAdd = (entity: Entity) => {}
  onEntityRemove = (entity: Entity) => {}
}

import { Engine } from '../engine'
import { TickEvent } from '../engine/clock'
import { Entity } from '../entity'
import { SystemQuery } from './system-query'

export class System {
  static priority: number
  engine!: Engine
  query = new SystemQuery([])

  async init() {}

  update(event: TickEvent, entities: Set<Entity>) {}
}

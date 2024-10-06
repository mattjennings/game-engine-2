import { Engine } from '../engine'
import { Entity } from '../entity'
import { SystemQuery } from './system-query'

export class System {
  static priority: number
  engine!: Engine
  query = new SystemQuery([])

  async init() {}

  update(delta: number, entities: Set<Entity>) {}
}

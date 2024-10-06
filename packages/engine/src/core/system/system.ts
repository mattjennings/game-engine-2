import { Entity } from '../entity'
import { SystemQuery } from './system-query'

export class System {
  static priority: number
  query = new SystemQuery([])

  async init() {}

  update(delta: number, entities: Set<Entity>) {}
}

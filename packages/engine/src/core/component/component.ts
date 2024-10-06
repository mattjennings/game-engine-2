import { Entity } from '../entity'
import { EventEmitter } from '../events/event-emitter'

export class Component extends EventEmitter {
  readonly entity: Entity | null = null
}

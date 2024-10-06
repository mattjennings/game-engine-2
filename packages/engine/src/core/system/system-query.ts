import { ConstructorOf } from '../../helpers'
import { Component } from '../component'
import { Entity } from '../entity'
import { EventEmitter } from '../events'
import { Scene } from '../scene'

export class SystemQuery extends EventEmitter<{
  entityadded: Entity
  entityremoved: Entity
}> {
  entities: Set<Entity> = new Set()

  private dirty: boolean = true
  private components: ConstructorOf<Component>[][] | null = null

  constructor(
    components?: ConstructorOf<Component>[],
    ...rest: ConstructorOf<Component>[][]
  ) {
    super()
    if (components) {
      this.components = [[...components], ...rest]
    }
  }

  invalidate() {
    this.dirty = true
  }

  get(scene: Scene) {
    if (!this.dirty || !this.components) {
      return this.entities
    }

    const previousEntities = new Set(this.entities)

    this.entities.clear()

    for (const entity of scene.entities) {
      for (const group of this.components) {
        if (group.every((component) => !!entity.getComponent(component))) {
          this.entities.add(entity)

          if (!previousEntities.has(entity)) {
            this.emit('entityadded', entity)
          }
          break
        }
      }
    }

    for (const entity of previousEntities) {
      if (!this.entities.has(entity)) {
        this.emit('entityremoved', entity)
      }
    }

    this.dirty = false
    return this.entities
  }
}

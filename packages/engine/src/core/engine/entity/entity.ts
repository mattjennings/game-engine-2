import { Engine } from '../../engine'
import { ConstructorOf } from '../../../helpers'
import { TickEvent } from '../clock'
import { Component } from '../component'
import { EventEmitter } from '../events'
import { Scene } from '../scene'

export abstract class Entity extends EventEmitter<{
  add: Scene
  remove: Scene
  destroy: void
  preupdate: UpdateEvent
  update: UpdateEvent
  postupdate: UpdateEvent
}> {
  scene?: Scene
  engine?: Engine
  components = new ComponentRegistry(this)

  onPreUpdate = (args: UpdateEvent) => {}

  onUpdate = (args: UpdateEvent) => {}

  onPostUpdate = (args: UpdateEvent) => {}

  /**
   * Removes the entity from the scene but does not destroy it.
   */
  remove() {
    if (this.scene) {
      this.scene.removeEntity(this)
      this.emit('remove', this.scene)
    }
  }

  /**
   * Destroys the entity and removes it from the scene.
   */
  destroy() {
    if (this.scene) {
      this.scene.removeEntity(this, true)
    }

    this.removeAllListeners()
    this.components.destroy()
    this.emit('destroy', void 0)
  }

  onAdd = (scene: Scene) => {}
  onRemove = (scene: Scene) => {}
}

export class ComponentRegistry {
  entity: Entity
  private components: Map<Function, Component> = new Map()

  constructor(entity: Entity) {
    this.entity = entity
  }

  add<T extends Component>(component: T): T {
    const root = this.getClassHierarchyRoot(component.constructor)

    this.components.set(root, component)
    component.entity = this.entity

    // maybe a bad idea, but we need to preserve the identify to remove it later
    component.onPreUpdate = component.onPreUpdate.bind(component)
    component.onUpdate = component.onUpdate.bind(component)
    component.onPostUpdate = component.onPostUpdate.bind(component)
    this.entity.on('preupdate', component.onPreUpdate)
    this.entity.on('update', component.onUpdate)
    this.entity.on('postupdate', component.onPostUpdate)
    return component
  }

  get<T extends Component>(cls: ConstructorOf<T>): T | undefined {
    const root = this.getClassHierarchyRoot(cls)
    const component = this.components.get(root)

    if (component && component instanceof cls) {
      return component as T
    }
    return undefined
  }

  remove(component: Component): void {
    this.components.delete(component.constructor)
    component.onRemove(this.entity)
    this.entity.off('preupdate', component.onPreUpdate)
    this.entity.off('update', component.onUpdate)
    this.entity.off('postupdate', component.onPostUpdate)
  }

  private getClassHierarchyRoot(cls: Function): Function {
    let current = cls
    let parent = Object.getPrototypeOf(current.prototype)?.constructor

    while (parent && parent !== Object && parent !== Component) {
      current = parent
      parent = Object.getPrototypeOf(current.prototype)?.constructor
    }
    return current
  }

  destroy() {
    for (const component of this.components.values()) {
      this.remove(component)
    }
  }

  *[Symbol.iterator]() {
    for (const component of this.components.values()) {
      yield component
    }
  }
}

export type UpdateEvent = TickEvent

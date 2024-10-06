import { Component } from '../component'
import { ConstructorOf } from '../../helpers'
import { Scene } from '../scene'
import { Engine } from '../engine'

export class Entity {
  scene?: Scene
  engine?: Engine
  components: Map<ConstructorOf<Component>, Component> = new Map()

  $<T extends Component>(component: T) {
    return this.addComponent(component)
  }

  addComponent<T extends Component>(component: T) {
    this.components.set(component.constructor as ConstructorOf<T>, component)

    // also include the prototype chain so we can query for components
    // that extend from a base
    let proto = Object.getPrototypeOf(component)
    while (proto) {
      if (proto.constructor === Component) {
        break
      }
      this.components.set(proto.constructor as ConstructorOf<T>, component)

      proto = Object.getPrototypeOf(proto)
    }

    // @ts-expect-error - it's a readonly property, but we set it from here
    component.entity = this

    return component
  }

  getComponent<T extends Component>(component: ConstructorOf<T>): T {
    return this.components.get(component) as T
  }

  removeComponent(component: Component) {
    this.components.delete(component.constructor as ConstructorOf<Component>)
  }

  onUpdate(delta: number) {}

  onPostUpdate(delta: number) {}

  remove() {
    if (this.scene) {
      this.scene.removeEntity(this)
    }
  }

  onAdd(scene: Scene) {}
  onRemove(scene: Scene) {}
}

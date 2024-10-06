import { Component } from '../component'
import { ConstructorOf } from '../../helpers'

export class Entity {
  components: Map<ConstructorOf<Component>, Component> = new Map()

  $<T extends Component>(component: T) {
    return this.addComponent(component)
  }

  addComponent<T extends Component>(component: T) {
    this.components.set(component.constructor as ConstructorOf<T>, component)

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

  onRemove() {}
}

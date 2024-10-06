import { Container, Sprite, Texture } from 'pixi.js'
import { Component, TransformComponent, UpdateEvent, Vector } from '../core'
import { RenderEvent } from './system'

export class PixiComponent<T extends Container> extends Component {
  container: T

  constructor(container: T) {
    super()
    this.container = container
  }

  render({ interpolationFactor }: RenderEvent): void {
    const transform = this.entity.$(TransformComponent)!

    const lerped = Vector.lerp(
      transform.prevPosition,
      transform.position,
      interpolationFactor,
    )

    this.container.x = lerped.x
    this.container.y = lerped.y
  }
}

export class PixiSpriteComponent extends PixiComponent<Sprite> {
  constructor(texture: Texture) {
    super(new Sprite(texture))
  }
}

import { Container, Sprite, Texture } from 'pixi.js'
import { Component, Entity, $Transform, Vector } from '../core'
import { RenderEvent } from './system'

export class $PixiContainer<T extends Container> extends Component {
  container: T

  constructor(entity: Entity, container: T) {
    super(entity)
    this.container = container
  }

  onRender({ interpolationFactor }: RenderEvent): void {
    const transform = this.entity.components.get($Transform)!

    const lerped = Vector.lerp(
      transform.prevPosition,
      transform.position,
      interpolationFactor,
    )

    this.container.x = lerped.x
    this.container.y = lerped.y
  }
}

export class $PixiSprite extends $PixiContainer<Sprite> {
  constructor(entity: Entity, texture: Texture) {
    super(entity, new Sprite(texture))
  }
}

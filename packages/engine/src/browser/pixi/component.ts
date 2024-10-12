import { Container, Sprite, Texture } from 'pixi.js'
import { Component, Entity } from '../../core'
import { RenderEvent } from './system'

export class $PixiContainer<T extends Container> extends Component {
  container: T

  constructor(entity: Entity, container: T) {
    super(entity)
    this.container = container
  }

  onRender(args: RenderEvent): void {}
}

export class $PixiSprite extends $PixiContainer<Sprite> {
  constructor(entity: Entity, texture: Texture) {
    super(entity, new Sprite(texture))
  }
}

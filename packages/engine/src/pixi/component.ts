import { Container, Sprite, Texture } from 'pixi.js'
import { Component, UpdateEvent } from '../core'
import { RenderEvent } from './system'

export class PixiComponent<T extends Container> extends Component {
  container: T

  private prevX = 0
  private prevY = 0

  constructor(container: T) {
    super()
    this.container = container
  }

  onUpdate(ev: UpdateEvent): void {}

  onPostUpdate(ev: UpdateEvent): void {
    this.prevX = this.container.x
    this.prevY = this.container.y
  }

  render({ interpolationFactor }: RenderEvent): void {
    const xDelta = this.container.x - this.prevX
    const yDelta = this.container.y - this.prevY

    // this.container.x = this.prevX + xDelta * interpolationFactor
    // this.container.y = this.prevY + yDelta * interpolationFactor
  }
}

export class PixiSpriteComponent extends PixiComponent<Sprite> {
  constructor(texture: Texture) {
    super(new Sprite(texture))
  }
}

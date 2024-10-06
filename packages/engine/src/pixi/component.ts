import { Sprite, Texture, View } from 'pixi.js'
import { Component } from '../core'

export class PixiComponent<T extends View> extends Component {
  view: T

  constructor(view: T) {
    super()
    this.view = view
  }

  render(delta: number, fixedDelta: number) {}
}

export class PixiSpriteComponent extends PixiComponent<Sprite> {
  constructor(texture: Texture) {
    super(new Sprite(texture))
  }
}

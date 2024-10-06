import { Sprite, Texture, View } from 'pixi.js'
import { Component } from '../core'

export class PixiComponent<T extends View> extends Component {
  view: T

  constructor(view: T) {
    super()
    this.view = view
  }
}

export class PixiSpriteComponent extends PixiComponent<View> {
  constructor(texture: Texture) {
    super(new Sprite(texture))
  }
}

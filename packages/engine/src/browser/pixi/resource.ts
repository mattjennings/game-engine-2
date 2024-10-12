import { Assets, Texture } from 'pixi.js'
import { Resource } from '../../core'

export class PixiTextureResource extends Resource<Texture> {
  constructor(public path: string) {
    super(path, () => Assets.load(path).then(() => Texture.from(path)))
  }
}

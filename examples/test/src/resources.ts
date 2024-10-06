import { Resources } from 'game-engine'
import { PixiTextureResource } from 'game-engine/pixi'

export const resources = new Resources({
  sprite: new PixiTextureResource('assets/bunny.png'),
})

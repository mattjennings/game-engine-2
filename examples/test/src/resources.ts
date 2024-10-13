import { Resources } from 'game-engine'
import { PixiTextureResource } from 'game-engine/browser'

export const resources = new Resources({
  sprite: new PixiTextureResource('assets/bunny.png'),
})

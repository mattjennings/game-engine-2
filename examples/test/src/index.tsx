import './index.css'
import { Engine, Entity, Scene, UpdateEvent } from 'game-engine'
import { PixiSpriteComponent, PixiSystem } from 'game-engine/pixi'
import { resources } from './resources'

class Player extends Entity {
  graphic = this.$(new PixiSpriteComponent(resources.get('sprite')))

  constructor() {
    super()
  }

  onUpdate({ delta }: UpdateEvent): void {
    this.graphic.container.x += 100 * delta
  }
}

class Level1 extends Scene {
  onStart() {
    this.addEntity(new Player())
  }
}

const engine = new Engine({
  resources,
  systems: [
    new PixiSystem({
      background: '#1099bb',
      resizeTo: window,
    }),
  ],
  scenes: {
    level1: new Level1(),
  },
})

engine.init()

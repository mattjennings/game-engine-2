import './index.css'
import {
  Engine,
  Entity,
  Scene,
  TransformComponent,
  UpdateEvent,
} from 'game-engine'
import { PixiSpriteComponent, PixiSystem } from 'game-engine/pixi'
import { resources } from './resources'

class Player extends Entity {
  transform = this.$(new TransformComponent())
  graphic = this.$(new PixiSpriteComponent(resources.get('sprite')))

  constructor() {
    super()
  }

  onUpdate({ delta }: UpdateEvent): void {
    this.transform.position.x += 100 * delta
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
      // maxFps: 60,
      background: '#1099bb',
      resizeTo: window,
    }),
  ],
  scenes: {
    level1: new Level1(),
  },
})

engine.init()

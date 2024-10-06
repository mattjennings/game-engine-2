/* @refresh reload */
import './index.css'
import { Engine, Entity, Scene } from 'game-engine'
import { PixiSpriteComponent, PixiSystem } from 'game-engine/pixi'
import { resources } from './resources'

class Player extends Entity {
  graphic = this.$(new PixiSpriteComponent(resources.get('sprite')))

  log = 0
  onUpdate(delta: number): void {
    this.log += delta

    if (this.log > 100) {
      console.log(delta)
      this.log = 0
    }

    this.graphic.view.x += 1 * delta
  }
}

class Level1 extends Scene {
  onStart() {
    this.addEntity(new Player())
  }
}

const engine = new Engine({
  updateFps: 60,
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

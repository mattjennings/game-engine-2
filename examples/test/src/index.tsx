import './index.css'
import {
  Engine,
  Entity,
  Scene,
  $Transform,
  UpdateEvent,
  listen,
} from 'game-engine'
import { $PixiSprite, PixiSystem } from 'game-engine/pixi'
import { resources } from './resources'

!!listen

class Player extends Entity {
  transform = new $Transform(this)
  graphic = new $PixiSprite(this, resources.get('sprite'))

  onUpdate({ delta }: UpdateEvent): void {
    this.transform.position.x += 100 * delta
  }

  abc() {}
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

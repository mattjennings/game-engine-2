/* @refresh reload */
import './index.css'
import { Engine, Entity, Scene } from 'game-engine'
import { PixiComponent, PixiSystem } from 'game-engine/pixi'
import { resources } from './resources'

class Player extends Entity {
  sprite = this.$(new PixiComponent(resources.get('sprite')))

  onUpdate(delta: number): void {}
}

class Level1 extends Scene {
  constructor() {
    super()
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
  updatesPerSecond: 60,
})

engine.init()

import { engine } from './engine'
import { $Transform, UpdateEvent } from 'game-engine'
import { $PixiSprite } from 'game-engine/browser'

class Player extends engine.Entity {
  transform = new $Transform(this)
  graphic = new $PixiSprite(this, engine.resources.get('sprite'))

  onUpdate = ({ delta }: UpdateEvent) => {
    const direction = engine.input.getLast({
      states: ['pressed', 'held'],
      inputs: ['ArrowLeft', 'ArrowRight'],
    })

    if (direction?.name === 'ArrowLeft') {
      this.transform.position.x -= 100 * delta
    } else if (direction?.name === 'ArrowRight') {
      this.transform.position.x += 100 * delta
    }
  }
}

@engine.addScene('level1')
class Level1 extends engine.Scene {
  onStart() {
    this.addEntity(new Player())
  }
}

await engine.start({ scene: 'level1' })

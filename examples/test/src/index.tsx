import './index.css'
import { Engine, Entity, Scene, $Transform, UpdateEvent } from 'game-engine'
import {
  $PixiSprite,
  PixiSystem,
  InputSystem,
  $Input,
} from 'game-engine/browser'
import { resources } from './resources'

class Player extends Entity {
  input = new $Input(this)
  transform = new $Transform(this)
  graphic = new $PixiSprite(this, resources.get('sprite'))

  onUpdate = ({ delta }: UpdateEvent) => {
    const direction = this.input.mostRecent({
      states: ['pressed', 'held'],
      keys: ['ArrowLeft', 'ArrowRight'],
    })

    if (direction?.key === 'ArrowLeft') {
      this.transform.position.x -= 100 * delta
    }

    if (direction?.key === 'ArrowRight') {
      this.transform.position.x += 100 * delta
    }
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
    new InputSystem(),
    new PixiSystem({
      application: {
        width: 800,
        height: 600,
        background: '#1099bb',
        autoDensity: true,
        resolution: window.devicePixelRatio,
      },
      onInit(app) {
        document.body.appendChild(app.view)

        function resizeCanvas() {
          const scaleX = window.innerWidth / app.renderer.width
          const scaleY = window.innerHeight / app.renderer.height

          const scale = Math.min(scaleX, scaleY) // Preserve aspect ratio

          const newWidth = Math.ceil(app.renderer.width * scale)
          const newHeight = Math.ceil(app.renderer.height * scale)

          // Resize the view and apply CSS scaling
          app.view.style.width = `${newWidth}px`
          app.view.style.height = `${newHeight}px`

          // Optionally center the canvas
          app.view.style.position = 'absolute'
          app.view.style.left = `${(window.innerWidth - newWidth) / 2}px`
          app.view.style.top = `${(window.innerHeight - newHeight) / 2}px`
        }

        window.addEventListener('resize', resizeCanvas)

        resizeCanvas()
      },
    }),
  ],
  scenes: {
    level1: Level1,
  },
})

engine.init()

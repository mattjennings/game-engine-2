import { Engine, Resources } from 'game-engine'
import {
  BrowserInput,
  PixiSystem,
  PixiTextureResource,
} from 'game-engine/browser'
import './index.css'

export const engine = new Engine({
  types: {} as {
    scenes: 'level1' | 'level2'
  },
  resources: new Resources({
    sprite: new PixiTextureResource('assets/bunny.png'),
  }),
  systems: [
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
  input: new BrowserInput({
    alias: {
      left: ['ArrowLeft', 'a'],
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      jump: 'Space',
    },
  }),
})

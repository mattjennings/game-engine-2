import { Application, ApplicationOptions } from 'pixi.js'

import { System } from '../core/system'
import { PixiComponent, PixiSpriteComponent } from './component'
import { SystemQuery } from '../core/system/system-query'
import { Entity } from '../core'

export interface PixiSystemArgs extends Partial<ApplicationOptions> {
  maxFps?: number
}
export class PixiSystem extends System {
  args: PixiSystemArgs
  application!: Application
  query = new SystemQuery([PixiComponent], [PixiSpriteComponent])

  private lastRenderTime = performance.now()

  constructor(args: PixiSystemArgs) {
    super()
    this.args = args

    this.query.on('entityadded', this.onEntityAdded.bind(this))
    this.query.on('entityremoved', this.onEntityRemoved.bind(this))
  }

  async init() {
    this.application = new Application()
    await this.application.init(this.args)
    this.application.stop()
    document.body.appendChild(this.application.canvas)

    requestAnimationFrame(this.render.bind(this))
  }

  render() {
    const newTime = performance.now()
    const delta = newTime - this.lastRenderTime / 1000

    const minFrameTime = this.args.maxFps ? 1000 / this.args.maxFps : 0

    if (delta >= minFrameTime) {
      this.lastRenderTime = newTime

      const fixedDelta = 1 / this.engine.clock.fps

      for (const entity of this.query.get(this.engine.scenes.current)) {
        const component = entity.getComponent(PixiComponent)

        component.emit('render', {
          delta: delta,
          fixedDelta: fixedDelta,
        })

        component.render(delta, fixedDelta)
      }

      this.application.render()
    }

    // Request the next frame
    requestAnimationFrame(this.render.bind(this))
  }

  onEntityAdded(entity: Entity) {
    const component = entity.getComponent(PixiComponent)
    if (component) {
      this.application.stage.addChild(component.view)
    }
  }

  onEntityRemoved(entity: Entity) {
    const component = entity.getComponent(PixiComponent)
    if (component) {
      this.application.stage.removeChild(component.view)
    }
  }
}

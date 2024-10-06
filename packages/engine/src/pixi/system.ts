import { Application, ApplicationOptions } from 'pixi.js'

import { System, SystemQuery } from '../core/engine'
import { $PixiContainer } from './component'
import { Entity, $Transform } from '../core'

export interface PixiSystemArgs extends Partial<ApplicationOptions> {
  maxFps?: number
}

export class PixiSystem extends System {
  args: PixiSystemArgs
  application!: Application
  query = new SystemQuery([$PixiContainer, $Transform])

  private lastRenderTime = performance.now()

  constructor(args: PixiSystemArgs) {
    super()
    this.args = args
  }

  async init() {
    await super.init()
    this.application = new Application()
    await this.application.init(this.args)
    this.application.stop()
    document.body.appendChild(this.application.canvas)

    requestAnimationFrame(this.render.bind(this))
  }

  render() {
    const newTime = performance.now()
    const delta = (newTime - this.lastRenderTime) / 1000

    const minFrameTime = this.args.maxFps ? 1 / this.args.maxFps : 0

    if (delta >= minFrameTime) {
      this.lastRenderTime = newTime

      for (const entity of this.query.get(this.engine.scenes.current)) {
        const component = entity.components.get($PixiContainer)!
        const interpolationFactor = Math.min(
          this.engine.clock.accumulatedFrameTime / (1 / this.engine.clock.fps),
        )

        component.render({
          delta,
          elapsed: this.engine.clock.elapsed,
          interpolationFactor,
        })
        component.emit('render', {
          delta: delta,
          elapsed: this.engine.clock.elapsed,
          interpolationFactor,
        })
      }

      this.application.render()
    }

    // Request the next frame
    requestAnimationFrame(this.render.bind(this))
  }

  onEntityAdded(entity: Entity) {
    const component = entity.components.get($PixiContainer)
    if (component) {
      this.application.stage.addChild(component.container)
    }
  }

  onEntityRemoved(entity: Entity) {
    const component = entity.components.get($PixiContainer)
    if (component) {
      this.application.stage.removeChild(component.container)
    }
  }
}

export interface RenderEvent {
  delta: number
  elapsed: number
  interpolationFactor: number
}

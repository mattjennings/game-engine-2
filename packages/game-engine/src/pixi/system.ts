import { Application, ApplicationOptions } from 'pixi.js'

import { listen, System, SystemQuery } from '../core/engine'
import { $PixiContainer } from './component'
import { Entity, $Transform } from '../core'

export interface PixiSystemArgs extends Partial<ApplicationOptions> {
  maxFps?: number
}

@listen.setup
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
    const interpolationFactor = Math.min(
      1,
      this.engine.clock.accumulatedFrameTime / this.engine.clock.fixedTimeStep,
    )
    const ev = {
      delta,
      elapsed: this.engine.clock.elapsed,
      interpolationFactor,
    }

    const maxFps = this.args.maxFps ? 1 / this.args.maxFps : 0
    queueMicrotask(() => {
      if (delta >= maxFps) {
        for (const entity of this.query.get(this.engine.scenes.current)) {
          const component = entity.components.get($PixiContainer)!

          component.onRender(ev)
          component.emit('render', ev)
        }

        this.lastRenderTime = newTime
        this.application.render()
      }
    })

    // Request the next frame
    requestAnimationFrame(this.render.bind(this))
  }

  @listen('query', 'entityadded')
  onEntityAdded(entity: Entity) {
    const component = entity.components.get($PixiContainer)
    if (component) {
      this.application.stage.addChild(component.container)
    }
  }

  @listen('query', 'entityremoved')
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

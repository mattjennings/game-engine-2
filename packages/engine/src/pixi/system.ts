import { Application, ApplicationOptions } from 'pixi.js'
import { System, SystemQuery } from '../core/engine'
import { $PixiContainer } from './component'
import { Entity, $Transform, Vector } from '../core'

export interface PixiSystemArgs extends Partial<ApplicationOptions> {
  application?: Partial<ApplicationOptions>
  maxFps?: number
  onInit?: (app: Application) => void
}

export class PixiSystem extends System {
  application!: Application
  query = new SystemQuery([$PixiContainer, $Transform])

  private applicationArgs: PixiSystemArgs
  private maxFps?: number
  private onInit?: (app: Application) => void
  private lastRenderTime = performance.now()

  constructor(args: PixiSystemArgs) {
    super()
    this.applicationArgs = args.application || {}
    this.maxFps = args.maxFps
    this.onInit = args.onInit
  }

  async init() {
    await super.init()
    this.application = new Application()
    await this.application.init(this.applicationArgs)
    this.application.stop()
    document.body.appendChild(this.application.canvas)
    this.onInit?.(this.application)
    requestAnimationFrame(this.render.bind(this))
  }

  render() {
    const newTime = performance.now()
    const delta = (newTime - this.lastRenderTime) / 1000
    const fixedDeltaTime = 1 / this.engine.clock.fps

    const interpolationFactor = Math.min(
      1,
      this.engine.clock.accumulatedFrameTime / fixedDeltaTime,
    )

    if (!this.maxFps || delta >= 1 / this.maxFps) {
      for (const entity of this.query.get(this.engine.scenes.current)) {
        const component = entity.components.get($PixiContainer)!
        const transform = entity.components.get($Transform)!

        const ev = {
          delta,
          elapsed: this.engine.clock.elapsed,
          interpolationFactor,
        }

        component.onRender(ev)
        component.emit('render', ev)

        const lerped = Vector.lerp(
          transform.prevPosition,
          transform.position,
          interpolationFactor,
        )

        component.container.x = lerped.x
        component.container.y = lerped.y
      }

      this.lastRenderTime = newTime
      this.application.render()
    }

    requestAnimationFrame(() => this.render())
  }

  onEntityAdded = (entity: Entity) => {
    const component = entity.components.get($PixiContainer)
    if (component) {
      this.application.stage.addChild(component.container)
    }
  }

  onEntityRemoved = (entity: Entity) => {
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

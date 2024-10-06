import { Application, ApplicationOptions } from 'pixi.js'

import { System } from '../core/system'
import { PixiComponent, PixiSpriteComponent } from './component'
import { SystemQuery } from '../core/system/system-query'
import { Entity } from '../core'

export class PixiSystem extends System {
  args: Partial<ApplicationOptions>
  application!: Application
  query = new SystemQuery([PixiComponent], [PixiSpriteComponent])

  private currentTime = performance.now()
  constructor(args: Partial<ApplicationOptions>) {
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
    const delta = (newTime - this.currentTime) / 1000
    this.currentTime = newTime

    for (const entity of this.query.get(this.engine.scenes.current)) {
      const component = entity.getComponent(PixiComponent)

      component.emit('render', {
        delta,
        fixedDelta: 1 / this.engine.systems.updateFps,
      })
      component.render(delta, 1 / this.engine.systems.updateFps)
    }

    this.application.render()
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

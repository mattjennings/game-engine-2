import { Application, ApplicationOptions } from 'pixi.js'

import { System } from '../core/system'
import { PixiComponent, PixiSpriteComponent } from './component'
import { SystemQuery } from '../core/system/system-query'
import { Entity } from '../core'

export class PixiSystem extends System {
  args: Partial<ApplicationOptions>
  application!: Application
  query = new SystemQuery([PixiComponent], [PixiSpriteComponent])

  constructor(args: Partial<ApplicationOptions>) {
    super()
    this.args = args

    this.query.on('entityadded', this.onEntityAdded.bind(this))
    this.query.on('entityremoved', this.onEntityRemoved.bind(this))
  }

  async init() {
    this.application = new Application()
    await this.application.init(this.args)
    document.body.appendChild(this.application.canvas)
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

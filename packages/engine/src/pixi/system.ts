import { Application, ApplicationOptions } from 'pixi.js'

import { System } from '../core/system'

export class PixiSystem extends System {
  args: Partial<ApplicationOptions>
  application!: Application

  constructor(args: Partial<ApplicationOptions>) {
    super()
    this.args = args
  }

  async init() {
    this.application = new Application()
    await this.application.init(this.args)
    document.body.appendChild(this.application.canvas)
  }
}

import { ConstructorOf } from '../../helpers'
import { Resources } from '../resources'
import { Scene } from '../scene'
import { System } from '../system'

export interface EngineArgs {
  systems: System[]

  /**
   * The number of times the engine should update each system per second.
   *
   * Note: this is NOT frame rate. The Renderer system should accept a frame rate
   * option.
   */
  updatesPerSecond?: number

  initialScene?: string
  scenes: Record<string, Scene>

  resources?: Resources<any>
}

export class Engine {
  systems = new SystemsManager(this)
  scenes = new SceneManager(this)
  resources: Resources<any>

  started = false

  private initialSceneKey: string

  constructor(args: EngineArgs) {
    this.resources = args.resources || new Resources()

    // systems
    this.systems.updatesPerSecond = args.updatesPerSecond || 60
    for (const system of args.systems) {
      this.systems.add(system)
    }

    // scenes
    for (const [name, scene] of Object.entries(args.scenes || {})) {
      this.scenes.add(name, scene)
    }

    this.initialSceneKey = args.initialScene ?? Object.keys(args.scenes)[0]

    if (!this.scenes.routes.has(this.initialSceneKey)) {
      throw new Error(
        `Initial scene "${this.initialSceneKey}" not found in scenes: ${Object.keys(
          args.scenes,
        ).join(', ')}`,
      )
    }
  }

  async init() {
    this.started = true
    this.scenes.goto(this.initialSceneKey)
    await this.systems.init()
    await this.resources.load()
  }

  pause() {
    this.systems.pause()
  }

  resume() {
    this.systems.resume()
  }
}

class SystemsManager {
  engine: Engine
  updatesPerSecond: number = 60
  timescale: number = 1

  private systems: System[] = []
  private looper?: number = undefined

  constructor(engine: Engine) {
    this.engine = engine
  }

  update() {
    const delta = 1000 / this.updatesPerSecond

    for (const entity of this.engine.scenes.current.entities) {
      entity.onUpdate(delta)
    }

    for (const system of this.systems) {
      system.update(delta)
    }

    for (const entity of this.engine.scenes.current.entities) {
      entity.onPostUpdate(delta)
    }
  }

  async init() {
    for (const system of this.systems) {
      await system.init()
    }

    this.resume()
  }

  pause() {
    if (!this.looper) {
      return
    }

    clearInterval(this.looper)
    this.looper = undefined
  }

  resume() {
    if (this.looper) {
      return
    }

    this.looper = setInterval(() => {
      this.update()
    }, 1000 / this.updatesPerSecond)
  }

  add(system: System) {
    this.systems.push(system)

    this.systems.sort(
      // @ts-ignore
      (a, b) => b.constructor['priority'] - a.constructor['priority'],
    )
  }

  remove(system: System) {
    this.systems.splice(this.systems.indexOf(system), 1)
  }

  get(system: ConstructorOf<System>) {
    return this.systems.find((s) => s.constructor === system)
  }
}

class SceneManager {
  routes: Map<string, Scene> = new Map()
  current!: Scene
  engine: Engine

  constructor(engine: Engine) {
    this.engine = engine
  }

  add(name: string, scene: Scene) {
    this.routes.set(name, scene)
  }

  goto(name: string) {
    if (!this.routes.has(name)) {
      throw new Error(`Scene "${name}" not found`)
    }

    this.current = this.routes.get(name)!
  }
}

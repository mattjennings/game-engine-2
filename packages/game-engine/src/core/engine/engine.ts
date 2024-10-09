import { ConstructorOf } from '../../helpers'
import { EventEmitter } from './events'
import { Resources } from './resources'
import { Scene } from './scene'
import { System } from './system'
import { Clock, TickEvent } from './clock'

export interface EngineArgs {
  systems: System[]

  clock?: Clock

  initialScene?: string
  scenes: Record<string, Scene>

  resources?: Resources<any>
}

export class Engine {
  systems = new Systems(this)
  scenes = new Scenes(this)
  clock = new Clock(this)
  resources: Resources<any>

  started = false

  private initialSceneKey: string

  constructor(args: EngineArgs) {
    this.resources = args.resources || new Resources()

    // clock
    if (args.clock) {
      this.clock = args.clock
    }

    this.clock.on('tick', this.systems.update.bind(this.systems))

    // systems
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

    this.scenes.on('change', () => {
      this.systems.invalidateQueries()
    })
  }

  async init() {
    this.started = true
    await this.resources.load()
    this.scenes.goto(this.initialSceneKey)
    await this.systems.init()
    this.clock.start()
  }

  pause() {
    this.systems.paused = true
  }

  resume() {
    this.systems.paused = false
  }
}

class Systems extends EventEmitter {
  engine: Engine
  paused = false

  private systems: System[] = []

  constructor(engine: Engine) {
    super()
    this.engine = engine
  }

  update(args: TickEvent) {
    if (!this.paused) {
      for (const entity of this.engine.scenes.current.entities) {
        entity.onPreUpdate(args)
        entity.emit('preupdate', args)
      }

      for (const entity of this.engine.scenes.current.entities) {
        entity.onUpdate(args)
        entity.emit('update', args)
      }

      for (const system of this.systems) {
        system.update(args, system.query.get(this.engine.scenes.current))
      }

      for (const entity of this.engine.scenes.current.entities) {
        entity.onPostUpdate(args)
        entity.emit('postupdate', args)
      }
    }
  }

  async init() {
    for (const system of this.systems) {
      await system.init()
    }
  }

  invalidateQueries() {
    for (const system of this.systems) {
      system.query.invalidate()
    }
  }

  add(system: System) {
    this.systems.push(system)
    system.engine = this.engine

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

class Scenes extends EventEmitter {
  routes: Map<string, Scene> = new Map()
  current!: Scene
  engine: Engine

  constructor(engine: Engine) {
    super()
    this.engine = engine
  }

  add(name: string, scene: Scene) {
    this.routes.set(name, scene)

    // @ts-expect-error
    scene._engine = this.engine
  }

  goto(name: string) {
    if (!this.routes.has(name)) {
      throw new Error(`Scene "${name}" not found`)
    }

    this.current = this.routes.get(name)!
    this.emit('change', this.current)
    this.current.onStart()
  }
}

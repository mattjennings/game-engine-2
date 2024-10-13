import { ConstructorOf } from '../../helpers'
import { EventEmitter } from './events'
import { Resources } from './resources'
import { Scene } from './scene'
import { System } from './system'
import { Clock, TickEvent } from './clock'
import { Input } from './input'
import { Entity } from 'game-engine'

export interface EngineArgs<
  TSceneKey extends string,
  TInput extends Input<any, any>,
  TResources extends Resources<any>,
> {
  clock?: Clock
  systems: System[]
  resources?: TResources
  input: TInput
  types?: {
    scenes?: TSceneKey
  }
}
interface EngineDefinition<
  TSceneKey extends string,
  TInput extends Input<any, any>,
  TResources extends Resources<any>,
> {
  scenes?: TSceneKey
  resources?: TResources
  input?: TInput
}

export type EngineScene<T> =
  T extends EngineDefinition<infer T, any, any> ? T : never
export type EngineInput<T> =
  T extends EngineDefinition<any, infer T, any> ? T : never
export type EngineResources<T> =
  T extends EngineDefinition<any, any, infer T> ? T : never

export class Engine<
  TSceneKey extends string = string,
  TInput extends Input<any, any> = Input<any, any>,
  TResources extends Resources<any> = Resources<any>,
  TEngine extends EngineDefinition<
    TSceneKey,
    TInput,
    TResources
  > = EngineDefinition<TSceneKey, TInput, TResources>,
> extends EventEmitter<{
  scenechange: { name: EngineScene<TEngine>; scene: Scene }
}> {
  systems: System[] = []
  input: EngineInput<TEngine>
  resources: EngineResources<TEngine>
  scenes: Record<EngineScene<TEngine>, Scene> = {} as any
  currentScene!: Scene

  clock = new Clock()

  paused = false
  started = false

  constructor(args: EngineArgs<TSceneKey, TInput, TResources>) {
    super()

    // resources
    this.resources = (args.resources ||
      new Resources()) as EngineResources<TEngine>

    // input
    this.input = args.input as EngineInput<TEngine>

    // clock
    if (args.clock) {
      this.clock = args.clock
    }

    // systems
    for (const system of args.systems) {
      this.addSystem(system)
    }
  }

  async start({ scene }: { scene: EngineScene<TEngine> }) {
    this.clock.on('tick', this.update.bind(this))
    this.on('scenechange', () => {
      for (const system of this.systems) {
        system.query.invalidate()
      }
    })

    this.started = true

    await this.resources.load()

    this.gotoScene(scene)

    for (const system of this.systems) {
      await system.init()
    }

    this.clock.start()
  }

  update(args: TickEvent) {
    if (!this.paused) {
      this.input.update()
      for (const entity of this.currentScene.entities) {
        entity.onPreUpdate(args)
        entity.emit('preupdate', args)
      }

      for (const entity of this.currentScene.entities) {
        entity.onUpdate(args)
        entity.emit('update', args)
      }

      for (const system of this.systems) {
        system.update(args, system.query.get(this.currentScene))
      }

      for (const entity of this.currentScene.entities) {
        entity.onPostUpdate(args)
        entity.emit('postupdate', args)
      }
    }
  }

  addSystem(system: System) {
    this.systems.push(system)
    system.engine = this

    this.systems.sort(
      // @ts-ignore
      (a, b) => b.constructor['priority'] - a.constructor['priority'],
    )
  }

  removeSystem(system: System) {
    this.systems.splice(this.systems.indexOf(system), 1)
  }

  getSystem(system: ConstructorOf<System>) {
    return this.systems.find((s) => s.constructor === system)
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }

  addScene(name: EngineScene<TEngine>): (Scene: ConstructorOf<Scene>) => void
  addScene(name: EngineScene<TEngine>, Scene: ConstructorOf<Scene>): void
  addScene(
    name: EngineScene<TEngine>,
    Scene?: ConstructorOf<Scene>,
  ): ((Scene: ConstructorOf<Scene>) => void) | void {
    if (Scene) {
      this.scenes[name] = new Scene()
    } else {
      return (Scene: ConstructorOf<Scene>) => {
        this.scenes[name] = new Scene()
      }
    }
  }

  gotoScene(name: EngineScene<TEngine>) {
    if (!this.scenes[name]) {
      throw new Error(`Scene "${name.toString()}" not found`)
    }

    if (this.currentScene) {
      this.currentScene.off('entityadd', this.onEntityAdd)
      this.currentScene.off('entityremove', this.onEntityRemove)
    }
    this.currentScene = this.scenes[name]!
    this.currentScene.on('entityadd', this.onEntityAdd)
    this.currentScene.on('entityremove', this.onEntityRemove)

    this.emit('scenechange', {
      name: name,
      scene: this.currentScene,
    })
    this.currentScene.onStart()
  }

  protected onEntityAdd = () => {
    for (const system of this.systems) {
      system.query.invalidate()
    }
  }

  protected onEntityRemove = () => {
    for (const system of this.systems) {
      system.query.invalidate()
    }
  }

  get Scene() {
    const engine = this
    const ctor = class extends Scene {
      constructor() {
        super()
        this.engine = engine
      }
    }

    return ctor
  }

  get Entity() {
    const engine = this
    const ctor = class extends Entity {
      constructor() {
        super()
        this.engine = engine
      }
    }

    return ctor
  }
}

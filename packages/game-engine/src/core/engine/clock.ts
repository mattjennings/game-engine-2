import { EventEmitter } from './events'
import { Engine } from './engine'

export interface TickEvent {
  delta: number
  elapsed: number
}

export class Clock extends EventEmitter<{
  tick: TickEvent
}> {
  engine: Engine

  elapsed = 0
  fps = 60
  maxFrameDelta = 0.25
  timescale = 1
  accumulatedFrameTime = 0

  private currentTime = performance.now()
  private timer: number | null = null

  constructor(engine: Engine, args?: { fps?: number; maxFrameDelta?: number }) {
    super()
    this.engine = engine

    if (args?.fps) {
      this.fps = args.fps
    }

    if (args?.maxFrameDelta) {
      this.maxFrameDelta = args.maxFrameDelta
    }
  }

  // https://gafferongames.com/post/fix_your_timestep/
  tick() {
    const newTime = performance.now()
    let frameTime = (newTime - this.currentTime) / 1000

    if (frameTime > 0.25) {
      frameTime = 0.25
    }

    this.currentTime = newTime
    this.elapsed += frameTime
    this.accumulatedFrameTime += frameTime

    const fixedDeltaTime = 1 / this.fps

    while (this.accumulatedFrameTime >= fixedDeltaTime) {
      this.emit('tick', { delta: fixedDeltaTime, elapsed: this.elapsed })
      this.accumulatedFrameTime -= fixedDeltaTime
    }

    this.timer = setTimeout(() => this.tick(), 0)
  }

  start() {
    if (this.timer) {
      return
    }

    this.tick()
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  get started() {
    return !!this.timer
  }

  get fixedTimeStep() {
    return 1 / this.fps
  }
}

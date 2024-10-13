import { EventEmitter } from './events'

export interface TickEvent {
  delta: number
  elapsed: number
}

export type TickerFn = (fn: () => void) => void
export class Clock extends EventEmitter<{
  tick: TickEvent
}> {
  elapsed = 0
  fps = 60
  maxFrameDelta = 0.25
  timescale = 1
  accumulatedFrameTime = 0

  private currentTime = performance.now()
  private timer: number | null = null

  private tickerFn: TickerFn =
    'document' in globalThis
      ? (fn) => setTimeout(fn, 0)
      : (fn) => requestAnimationFrame(fn)

  constructor(args?: {
    fps?: number
    maxFrameDelta?: number
    tickerFn?: (fn: () => void) => void
  }) {
    super()

    if (args?.fps) {
      this.fps = args.fps
    }

    if (args?.maxFrameDelta) {
      this.maxFrameDelta = args.maxFrameDelta
    }

    if (args?.tickerFn) {
      this.tickerFn = args.tickerFn
    }
  }

  // https://gafferongames.com/post/fix_your_timestep/
  tick() {
    const newTime = performance.now()
    let frameTime = (newTime - this.currentTime) / 1000

    frameTime = Math.min(frameTime, 0.25)

    this.currentTime = newTime
    this.elapsed += frameTime
    this.accumulatedFrameTime += frameTime

    const fixedDeltaTime = 1 / this.fps

    while (this.accumulatedFrameTime >= fixedDeltaTime) {
      this.emit('tick', { delta: fixedDeltaTime, elapsed: this.elapsed })
      this.accumulatedFrameTime -= fixedDeltaTime
    }

    this.tickerFn(this.tick.bind(this))
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

import { EventEmitter } from './events'

export class Input<
  Keys extends Record<string, string> = Record<string, string>,
  InputMap extends Record<string, keyof Keys> = {},
> extends EventEmitter {
  inputMap = new Map<keyof InputMap, InputState<keyof InputMap>>()
  current = new Map<keyof Keys, InputState<keyof Keys>>()

  constructor({ inputMap }: { inputMap: InputMap }) {
    super()
    this.inputMap = new Map(Object.entries(inputMap)) as any
  }

  setInputState({
    name,
    state,
  }: {
    name: keyof Keys
    state: 'pressed' | 'held' | 'released' | null
  }) {
    if (state === null) {
      this.current.delete(name)
      return
    }

    this.current.set(name, {
      name,
      state,
      timestamp: this.current.get(name)?.timestamp ?? performance.now(),
    })
  }

  getInputState(name: keyof Keys | keyof InputMap) {
    return this.current.get(
      (this.inputMap.get(name as keyof InputMap) || name) as keyof Keys,
    )
  }

  update() {
    for (const [name, { state }] of this.current) {
      if (state === 'pressed') {
        this.setInputState({ name, state: 'held' })
      } else if (state === 'released') {
        this.setInputState({ name, state: null })
      }
    }
  }

  /**
   * Returns true if the key was pressed in the most recent frame
   */
  wasPressed(...inputs: Array<keyof InputMap | keyof Keys>) {
    return inputs.some(
      (input) => this.getInputState(input)?.state === 'pressed',
    )
  }

  /**
   * Returns true if the key is currently pressed or held down
   */
  isHeld(...inputs: Array<keyof InputMap | keyof Keys>) {
    return inputs.some((input) => {
      const state = this.getInputState(input)?.state

      return state === 'pressed' || state === 'held'
    })
  }

  /**
   * Returns true if the key was released in the most recent frame
   */
  wasReleased(...inputs: Array<keyof InputMap | keyof Keys>) {
    return inputs.some(
      (input) => this.getInputState(input)?.state === 'released',
    )
  }

  /**
   * Returns the most recent key that matches the given state
   */
  getLast({
    states,
    inputs,
  }: {
    states: Array<InputState<any>['state']>
    inputs: Array<keyof InputMap | keyof Keys>
  }) {
    let mostRecent: InputState<keyof Keys | keyof InputMap> | undefined

    for (const input of inputs) {
      const inputState = this.getInputState(input)
      if (
        inputState &&
        states.find((state) => state === inputState.state) &&
        (!mostRecent || inputState.timestamp > mostRecent.timestamp)
      ) {
        mostRecent = {
          name: input,
          state: inputState.state,
          timestamp: inputState.timestamp,
        }
      }
    }

    return mostRecent
  }
}

export interface InputState<Input extends string | number | symbol> {
  name: Input
  state: 'pressed' | 'held' | 'released'
  timestamp: number
}

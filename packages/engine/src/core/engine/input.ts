import { EventEmitter } from './events'

export interface AliasMap<Keys extends Record<string, string>> {
  [key: string]: keyof Keys | Array<keyof Keys>
}

export class Input<
  Keys extends Record<string, string> = Record<string, string>,
  Alias extends AliasMap<Keys> = {},
> extends EventEmitter {
  alias = new Map<keyof Alias, Array<keyof Keys>>()
  inputs = new Map<string, keyof Keys>()
  current = new Map<keyof Keys, InputState<keyof Keys>>()

  constructor({ inputs, alias }: { inputs: Keys; alias?: Alias }) {
    super()

    for (const [key, value] of Object.entries(inputs)) {
      this.inputs.set(value, key as keyof Keys)
    }

    if (alias) {
      for (const [key, value] of Object.entries(alias)) {
        this.alias.set(
          key as keyof Alias,
          Array.isArray(value) ? value : [value],
        )
      }
    }
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

  getInputState(name: keyof Keys | keyof Alias) {
    const aliased = this.alias.get(name as keyof Alias)

    if (aliased) {
      for (const alias of aliased) {
        const state = this.current.get(alias)
        if (state) {
          return state
        }
      }
    }

    return this.current.get(name as keyof Keys)
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
  wasPressed(...inputs: Array<keyof Alias | keyof Keys>) {
    return inputs.some(
      (input) => this.getInputState(input)?.state === 'pressed',
    )
  }

  /**
   * Returns true if the key is currently pressed or held down
   */
  isHeld(...inputs: Array<keyof Alias | keyof Keys>) {
    return inputs.some((input) => {
      const state = this.getInputState(input)?.state

      return state === 'pressed' || state === 'held'
    })
  }

  /**
   * Returns true if the key was released in the most recent frame
   */
  wasReleased(...inputs: Array<keyof Alias | keyof Keys>) {
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
    inputs: Array<keyof Alias | keyof Keys>
  }) {
    let mostRecent: InputState<keyof Keys | keyof Alias> | undefined

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

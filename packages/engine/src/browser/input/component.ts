import { Component, Entity } from '../../core'

interface KeyState {
  key: Key
  state: 'pressed' | 'held' | 'released'
  timestamp: number
}

export class $Input extends Component {
  private static instances = new Set<$Input>()
  static keys = new Map<string, KeyState>()

  constructor(entity: Entity) {
    super(entity)
    $Input.instances.add(this)
  }

  static init() {
    window.addEventListener('keydown', (ev) => {
      if ($Input.keys.has(ev.key)) {
        return
      }

      $Input.keys.set(ev.key, {
        key: ev.key as Key,
        state: 'pressed',
        timestamp: performance.now(),
      })
    })
    window.addEventListener('keyup', (ev) => {
      $Input.keys.set(ev.key, {
        key: ev.key as Key,
        state: 'released',
        timestamp: performance.now(),
      })
    })
  }

  onRemove(): void {
    $Input.instances.delete(this)
  }

  static update() {
    for (const [key, { state, timestamp }] of $Input.keys) {
      if (state === 'pressed') {
        $Input.keys.set(key, { key: key as Key, state: 'held', timestamp })
      } else if (state === 'released') {
        $Input.keys.delete(key)
      }
    }
  }

  /**
   * Returns true if the key was pressed in the most recent frame
   */
  wasPressed(key: Key) {
    return $Input.keys.get(key)?.state === 'pressed'
  }

  /**
   * Returns true if the key is currently held down
   */
  isHeld(key: Key) {
    return (
      $Input.keys.get(key)?.state === 'held' ||
      $Input.keys.get(key)?.state === 'pressed'
    )
  }

  /**
   * Returns true if the key was released in the most recent frame
   */
  wasReleased(key: Key) {
    return $Input.keys.get(key)?.state === 'released'
  }

  /**
   * Returns the most recent key that matches the given state
   */
  mostRecent({
    states,
    keys,
  }: {
    states: Array<KeyState['state']>
    keys: Key[]
  }): KeyState | undefined {
    let mostRecent: KeyState | undefined

    for (const key of keys) {
      const keyState = $Input.keys.get(key)

      if (
        keyState &&
        states.includes(keyState.state) &&
        keyState.timestamp > (mostRecent?.timestamp ?? 0)
      ) {
        mostRecent = keyState
      }
    }

    return mostRecent
  }
}

export type Key = keyof typeof Keys

export const Keys = {
  // Modifier keys
  Shift: 'Shift',
  Control: 'Control',
  Alt: 'Alt',
  Meta: 'Meta', // Command key on macOS, Windows key on Windows

  // Alphabet keys
  a: 'a',
  b: 'b',
  c: 'c',
  d: 'd',
  e: 'e',
  f: 'f',
  g: 'g',
  h: 'h',
  i: 'i',
  j: 'j',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  o: 'o',
  p: 'p',
  q: 'q',
  r: 'r',
  s: 's',
  t: 't',
  u: 'u',
  v: 'v',
  w: 'w',
  x: 'x',
  y: 'y',
  z: 'z',

  // Number keys (Top row)
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',

  // Number pad keys
  Numpad0: 'Numpad0',
  Numpad1: 'Numpad1',
  Numpad2: 'Numpad2',
  Numpad3: 'Numpad3',
  Numpad4: 'Numpad4',
  Numpad5: 'Numpad5',
  Numpad6: 'Numpad6',
  Numpad7: 'Numpad7',
  Numpad8: 'Numpad8',
  Numpad9: 'Numpad9',
  NumpadDecimal: 'NumpadDecimal',
  NumpadAdd: 'NumpadAdd',
  NumpadSubtract: 'NumpadSubtract',
  NumpadMultiply: 'NumpadMultiply',
  NumpadDivide: 'NumpadDivide',

  // Function keys
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  F13: 'F13',
  F14: 'F14',
  F15: 'F15',
  F16: 'F16',
  F17: 'F17',
  F18: 'F18',
  F19: 'F19',
  F20: 'F20',

  // Special keys
  Backspace: 'Backspace',
  Tab: 'Tab',
  Enter: 'Enter',
  Escape: 'Escape',
  Space: 'Space',
  Delete: 'Delete',
  Insert: 'Insert',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',

  // Arrow keys
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',

  // Symbol keys
  '!': '!',
  '@': '@',
  '#': '#',
  $: '$',
  '%': '%',
  '^': '^',
  '&': '&',
  '*': '*',
  '(': '(',
  ')': ')',
  '-': '-',
  _: '_',
  '=': '=',
  '+': '+',
  '[': '[',
  '{': '{',
  ']': ']',
  '}': '}',
  ';': ';',
  ':': ':',
  "'": "'",
  '"': '"',
  ',': ',',
  '<': '<',
  '.': '.',
  '>': '>',
  '/': '/',
  '?': '?',
  '\\': '\\',
  '|': '|',
  '`': '`',
  '~': '~',

  // Lock keys
  CapsLock: 'CapsLock',
  NumLock: 'NumLock',
  ScrollLock: 'ScrollLock',
}

import { EventEmitter } from './event-emitter'

type EventMapOf<T> = T extends EventEmitter<infer E> ? E : never

const bindings = Symbol('bindings')

export function listen<
  T,
  P extends keyof T,
  E extends EventEmitter<any> = T[P] extends EventEmitter<any> ? T[P] : never,
  K extends keyof EventMapOf<E> = keyof EventMapOf<E>,
>(
  event: K,
  options?: { member: P },
): (target: T, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return function (_target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    let target = _target as T & { [bindings]: any[] }

    if (!target[bindings]) {
      target[bindings] = []
    }

    target[bindings].push({
      memberName: options?.member,
      event,
      methodName: propertyKey,
    })

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args)
    }
  }
}

listen.setup = function <T extends { new (...args: any[]): {} }>(
  constructor: T,
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args)

      const self = this as any
      if (self[bindings]) {
        self[bindings].forEach(({ memberName, event, methodName }: any) => {
          if (memberName) {
            const instanceProperty = self[memberName]
            if (instanceProperty) {
              instanceProperty.on(event, self[methodName].bind(this))
            } else {
              // no-op, if this class is inherited it might have it so we cant throw
            }
          } else {
            if (self[methodName]) {
              self.on(event, self[methodName].bind(this))
            }
          }
        })
      }
    }
  }
}

// @listen.setup
// class A extends EventEmitter<{
//   update: {}
// }> {
//   query = new EventEmitter<{ entityadded: {} }>()

//   @listen('query', { member: 'entityadded' })
//   onEntityAdded(entity: any) {
//     console.log('Entity added:', entity)
//   }

//   @listen('update')
//   onUpdate() {}
// }

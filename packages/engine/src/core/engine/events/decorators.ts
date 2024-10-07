import { EventEmitter } from './event-emitter'

type EventMapOf<T> = T extends EventEmitter<infer E> ? E : never

const bindings = Symbol('bindings')

// @listen('member', 'event')
export function listen<
  T,
  P extends keyof T,
  E extends EventEmitter<any> = T[P] extends EventEmitter<any> ? T[P] : never,
  K extends keyof EventMapOf<E> = keyof EventMapOf<E>,
>(
  member: P,
  event: K,
): (target: T, propertyKey: string, descriptor: PropertyDescriptor) => void

// @listen('event')
export function listen<T extends string>(
  event: T,
): (
  target: EventEmitter<Record<T, any>>,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => void

// impl
export function listen<T extends string>(
  memberNameOrEvent: T | string,
  event?: T,
): (
  target: EventEmitter<Record<T, any>>,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) => void {
  return function (
    target: EventEmitter<Record<T, any>> & { [bindings]?: any[] },
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value
    const isLocalEvent = typeof memberNameOrEvent === 'string' && !event

    if (!target[bindings]) {
      target[bindings] = []
    }

    target[bindings].push({
      memberName: isLocalEvent ? undefined : memberNameOrEvent,
      event: isLocalEvent ? (memberNameOrEvent as T) : event!,
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

//   @listen('query', 'entityadded')
//   onEntityAdded(entity: any) {
//     console.log('Entity added:', entity)
//   }

//   @listen('update')
//   onUpdate() {}
// }

export class Resources<T extends string> {
  loaded: Map<T, Resource> = new Map()
  queued: Map<T, Resource> = new Map()

  private loadingPromise: Promise<void> | undefined

  constructor(map?: Record<T, Resource>) {
    if (map) {
      for (const [name, resource] of Object.entries(map)) {
        this.add(name as T, resource as Resource)
      }
    }
  }

  add(name: T, resource: Resource) {
    this.queued.set(name, resource)
  }

  get(name: T) {
    const resource = this.loaded.get(name)
    if (!resource) {
      throw new Error(`Resource "${name}" was not loaded`)
    }
    return resource.get()
  }

  unload(name: T) {
    this.loaded.delete(name)
    this.queued.delete(name)
  }

  async load() {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // todo: load in parallel
    this.loadingPromise = new Promise(async (res, rej) => {
      for (const [name, resource] of this.queued) {
        try {
          await resource.load()
          if (this.queued.has(name)) {
            this.loaded.set(name, resource)
          }
        } catch (e) {
          rej(e)
        }
      }
      res()
    })

    return this.loadingPromise
  }

  get progress() {
    return this.loaded.size / (this.loaded.size + this.queued.size)
  }
}

export class Resource<T = any> {
  error: Error | null = null

  private value?: T
  private name: string
  private loader: (name: string) => Promise<any>
  private promise: Promise<T> | undefined

  constructor(name: string, loader: (name: string) => Promise<T>) {
    this.name = name
    this.loader = loader
  }

  get() {
    if (this.error) {
      throw this.error
    }

    if (!this.value && !!this.promise) {
      throw new Error(`Resource "${this.name}" was not loaded`)
    }

    return this.value!
  }

  get loading() {
    return !!this.promise
  }

  async load() {
    if (this.loading) {
      return this.promise
    }

    this.promise = this.loader(name)
      .then((v) => {
        this.value = v
        return v
      })
      .catch((e) => {
        this.error = e
        e.message = `Failed to load resource "${this.name}": ${e.message}`
        return Promise.reject(e)
      })

    return this.promise
  }
}

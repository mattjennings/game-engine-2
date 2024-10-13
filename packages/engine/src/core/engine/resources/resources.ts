export class Resources<T extends Record<string, Resource>> {
  loaded: Partial<T> = {}
  queued: Partial<T> = {}

  private loadingPromise: Promise<void> | undefined

  constructor(map?: T) {
    if (map) {
      for (const [name, resource] of Object.entries(map)) {
        this.add(name, resource as Resource)
      }
    }
  }

  add(name: keyof T, resource: Resource) {
    this.queued[name] = resource as T[keyof T]
  }

  get<K extends keyof T>(name: K) {
    const resource = this.loaded[name]
    if (!resource) {
      throw new Error(`Resource "${name as string}" was not loaded`)
    }
    return resource.get()
  }

  unload(name: keyof T) {
    delete this.loaded[name]
    delete this.queued[name]
  }

  async load() {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    // todo: load in parallel
    this.loadingPromise = new Promise(async (res, rej) => {
      for (const [name, resource] of Object.entries(this.queued)) {
        try {
          await resource.load()
          if (this.queued[name]) {
            this.loaded[name as keyof T] = resource
            delete this.queued[name]
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
    return (
      Object.keys(this.loaded).length /
      (Object.keys(this.loaded).length + Object.keys(this.queued).length)
    )
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

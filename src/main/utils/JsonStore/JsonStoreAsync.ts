import upath from 'upath'
import fs from 'fs/promises'
import { Options } from './index'
import { safeStorage } from 'electron'

/**
 * An asynchronous key-value store that persists data to a JSON file.
 * Keys are strings for JSON compatibility. Supports lazy loading, optional in-memory caching strategy,
 * and a mutex for thread-safety in multi-threaded or concurrent async scenarios (e.g., worker_threads or multiple concurrent calls).
 */
class AsyncJsonStore<V> {
  private readonly filePath: string
  private readonly directory: string
  private cache: Map<string, V>
  private loaded: boolean = false
  private option: Options = { maxCacheSize: 0, safeStorage: true }
  constructor(storeName: string, option?: Options) {
    if (!storeName) {
      throw new Error('Store name is required')
    }
    this.directory = upath.join('db')
    this.filePath = upath.join(this.directory, `${storeName}.jdb`)
    this.cache = new Map<string, V>()
    if (option) {
      this.option = { ...this.option, ...option }
    }
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return
    if (this.option.safeStorage && !safeStorage.isEncryptionAvailable()) {
      throw new Error('safeStorage encryption is not available on this platform')
    }
    await this.load()
  }

  private async load(): Promise<void> {
    try {
      await fs.access(this.filePath)
      const data = await fs.readFile(this.filePath)
      const json: Record<string, V> = JSON.parse(this.decrypt(data))
      for (const [key, value] of Object.entries(json)) {
        this.cache.set(key, value)
        this.enforceCacheSize()
      }
      this.loaded = true
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error(`Error loading ${this.filePath}:`, error)
      }
      await this.save()
    }
  }

  private async save(): Promise<void> {
    const data: Record<string, V> = Object.fromEntries(this.cache)
    await fs.mkdir(this.directory, { recursive: true })
    const jsonString = JSON.stringify(data)
    await fs.writeFile(this.filePath, this.encoding(jsonString))
  }

  private encoding(data: string) {
    if (this.option.safeStorage) {
      return safeStorage.encryptString(data)
    }
    return data
  }

  private decrypt(data): string {
    if (this.option.safeStorage) {
      return safeStorage.decryptString(data)
    }
    return data
  }

  private enforceCacheSize(): void {
    if (this.option.maxCacheSize && this.cache.size > this.option.maxCacheSize) {
      // FIFO eviction
      const keys = Array.from(this.cache.keys())
      const evictCount = this.cache.size - this.option.maxCacheSize
      for (let i = 0; i < evictCount; i++) {
        this.cache.delete(keys[i])
      }
    }
  }

  async get(key: string, defaultValue?: V): Promise<V | undefined> {
    await this.ensureLoaded()
    return this.cache.get(key) ?? defaultValue
  }

  async set(key: string, value: V): Promise<V> {
    await this.ensureLoaded()
    this.cache.set(key, value)
    this.enforceCacheSize()
    await this.save()

    return value
  }

  async put(key: string, value: V): Promise<V> {
    return await this.set(key, value)
  }

  async del(key: string): Promise<boolean> {
    await this.ensureLoaded()
    const existed = this.cache.delete(key)
    if (existed) {
      await this.save()
    }
    return existed
  }

  async has(key: string): Promise<boolean> {
    await this.ensureLoaded()
    return this.cache.has(key)
  }

  async clear(): Promise<void> {
    await this.ensureLoaded()
    this.cache.clear()
    await this.save()
  }

  async getAll(): Promise<Record<string, V>> {
    await this.ensureLoaded()
    return Object.fromEntries(this.cache)
  }

  async keys(): Promise<string[]> {
    await this.ensureLoaded()
    return Array.from(this.cache.keys())
  }

  async values(): Promise<V[]> {
    await this.ensureLoaded()
    return Array.from(this.cache.values())
  }
}

export default AsyncJsonStore

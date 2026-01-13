import upath from 'upath'
import fs from 'fs'
import { Options } from './index'
import { safeStorage } from 'electron'
import { createHexDigest } from '../common'

/**
 * A simple key-value store that persists data to a JSON file.
 * Note: Keys are restricted to strings for JSON compatibility, as JSON object keys are always strings.
 * If numeric keys are needed, they will be stringified during persistence.
 */
class JsonStore<V> {
  private readonly filePath: string
  private readonly directory: string
  private readonly cache: Map<string, V>
  private loaded: boolean
  private option: Options = { maxCacheSize: 0, safeStorage: true }
  constructor(storeName: string, option?: Options) {
    console.log('加载', storeName)
    if (!storeName) {
      throw new Error('JsonStore storeName is required')
    }
    if (option) {
      this.option = { ...this.option, ...option }
    }
    this.directory = this.option.dirPath || upath.join('db')
    this.filePath = upath.join(this.directory, `${createHexDigest(storeName)}.jdb`)
    this.cache = new Map<string, V>()
    this.loaded = false
  }

  private load() {
    if (this.loaded) {
      return
    }
    this.loaded = true
    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath)
        const json: Record<string, V> = JSON.parse(this.decrypt(data))
        for (const [key, value] of Object.entries(json)) {
          this.cache.set(key, value)
        }

        // console.log(`${this.filePath} loaded successfully`);
      } catch (error) {
        console.error(`JsonStore Error loading ${this.filePath}:`, error)
        this.save()
      }
    } else {
      this.save()
    }
  }

  private save() {
    const data: Record<string, V> = {}
    this.cache.forEach((value, key) => {
      data[key] = value
    })

    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true })
      // console.log(`Created directory: ${this.directory}`);
    }
    const jsonString = JSON.stringify(data)
    fs.writeFileSync(this.filePath, this.encoding(jsonString))
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

  get(key: string, defaultValue?: V): V | undefined {
    this.ensureLoaded()
    return this.cache.get(key) ?? defaultValue
  }

  set(key: string, value: V): V {
    this.ensureLoaded()
    this.cache.set(key, value)
    this.save()
    return value
  }

  put(key: string, value: V): V {
    return this.set(key, value)
  }

  del(key: string): boolean {
    this.ensureLoaded()
    const existed = this.cache.delete(key)
    if (existed) {
      this.save()
    }
    return existed
  }

  has(key: string): boolean {
    this.ensureLoaded()
    return this.cache.has(key)
  }

  clear(): void {
    this.ensureLoaded()
    this.cache.clear()
    this.save()
  }

  getAll(): Record<string, V> {
    this.ensureLoaded()
    return Object.fromEntries(this.cache.entries())
  }

  keys(): string[] {
    this.ensureLoaded()
    return Array.from(this.cache.keys())
  }

  values(): V[] {
    this.ensureLoaded()
    return Array.from(this.cache.values())
  }

  private ensureLoaded() {
    if (!this.loaded) {
      if (this.option.safeStorage && !safeStorage.isEncryptionAvailable()) {
        throw new Error('safeStorage encryption is not available on this platform')
      }
      this.load()
    }
  }
}

export default JsonStore

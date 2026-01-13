import { db } from './database'
import { v4 as uuidv4 } from 'uuid'
import JsonStore from './JsonStore/JsonStore'

export enum ConfigKeys {
  AutoUpdate = 'autoUpdate',
  ClientId = 'clientId'
}

export class SystemConfig {
  private store: JsonStore<any, any>

  constructor() {
    this.store = db.app
  }

  getAutoUpdate(): boolean {
    return this.get(ConfigKeys.AutoUpdate, true)
  }

  setAutoUpdate(value: boolean): void {
    this.set(ConfigKeys.AutoUpdate, value)
  }

  getClientId(): string {
    let clientId = this.get<string>(ConfigKeys.ClientId)

    if (!clientId) {
      clientId = uuidv4()
      this.set(ConfigKeys.ClientId, clientId)
    }

    return clientId
  }

  set(key: string, value: any): void {
    this.store.set(key, value)
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.store.get(key, defaultValue) as T
  }
}

export const systemConfig = new SystemConfig()

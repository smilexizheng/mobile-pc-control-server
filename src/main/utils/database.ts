import JsonStore from './JsonStore/JsonStore'
import { is } from '@electron-toolkit/utils'
import { app as electronApp } from 'electron'
import upath from 'upath'

const dbPath = !is.dev
  ? upath.join(electronApp.getPath('home'), '.control-server/data')
  : upath.join('db')

const schedule = new JsonStore<ScheduleJob>('schedule', { dirPath: dbPath })
const app = new JsonStore<any>('app', { dirPath: dbPath })
const events = new JsonStore<any>('events', { dirPath: dbPath, safeStorage: true })

const getSettings = () => {
  return app.get('app:settings', {
    port: 3000,
    token: 'ssss',
    hostname: '0.0.0.0',
    quality: 50,
    autoStart: true
  })
}

const db = {
  app,
  schedule,
  events,
  getSettings
}
export { db }

import { Level } from 'level'
import upath from 'upath'
import { is } from '@electron-toolkit/utils'
import { app as electronApp } from 'electron'

const dbPath = !is.dev ? upath.join(electronApp.getPath('home'), '.control-server/data') : upath.join(process.cwd(), 'db')

const schedule: Level<string, ScheduleJob> = new Level(upath.join(dbPath, 'schedule'), {
  valueEncoding: 'json'
})
const app = new Level<string,number|string|object|any>(upath.join(dbPath, 'app'), { valueEncoding: 'json' })

const events = new Level<string,SocketEvent>(upath.join(dbPath, 'events'), { valueEncoding: 'json' })


const getAll = async (db) => {
  const result= []
  for await (const value of db.values()) {
    // @ts-ignore
    result.push(value)
  }
  return result
}

const db = {
  app,
  schedule,
  events,
  getAll
}
export {db,getAll}

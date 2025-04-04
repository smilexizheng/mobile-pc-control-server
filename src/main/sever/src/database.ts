import { Level } from 'level'
import upath from 'upath'
import { is } from '@electron-toolkit/utils'

const dbPath = !is.dev ? upath.join(process.cwd(), 'db') : upath.join(process.cwd(), 'db')

const schedule: Level<string, ScheduleJob> = new Level(upath.join(dbPath, 'schedule'), {
  valueEncoding: 'json'
})
const app = new Level(upath.join(dbPath, 'app'), { valueEncoding: 'json' })

const db = {
  app,
  schedule
}
export default db

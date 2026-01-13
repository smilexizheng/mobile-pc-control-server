import schedule, { Job } from 'node-schedule'
import { db } from '../../utils/database'
import { eventHandler } from './core'

/**
 * 创建定时任务
 * @param data
 */
const createJob = (data: ScheduleJob) => {
  if (data.id) {
    deleteJob(data.id)
  }
  const id = data.id || crypto.randomUUID()
  data = { ...data, id }
  db.schedule.put(id, data)
  if (data.runOnCreate) {
    runJob(data)
  }
}

const runJob = (data): void => {
  if (!data.cron) return
  schedule.scheduleJob(data.id, data.cron, function () {
    // todo save  job log
    console.log(`${data.id}>>>>>${data.name} has run at ${new Date()}`)
    console.log(data)
    if (data.events) {
      data.events.forEach((event) => {
        setTimeout(() => {
          eventHandler(event)
        }, event.delay || 0)
      })
    }
  })
}

/**
 * 取消任务
 * @param id
 */
const cancelJob = (id): void => {
  if (!hasJob(id)) return
  schedule.scheduledJobs[id].cancel()
}

/**
 * 删除job
 * @param id
 */
const deleteJob = (id) => {
  db.schedule.del(id)
  if (!hasJob(id)) return
  schedule.scheduledJobs[id].deleteFromSchedule()
}

/**
 * 切换运行状态
 * @param id
 */
const toggleJob = (id) => {
  if (hasJob(id)) {
    schedule.scheduledJobs[id].cancel()
  } else {
    createJob(db.schedule.get(id)!)
  }
}

/**
 * 是否存在任务
 * @param id
 * @returns {boolean}
 */
const hasJob = (id): boolean => {
  return !!schedule.scheduledJobs[id]
}
/**
 * 获取任务
 * @param id
 * @returns {*|null}
 */
const getJob = (id): Job | null => {
  if (!hasJob(id)) return null
  return schedule.scheduledJobs[id]
}

const getScheduleJobs = (): { [jobName: string]: Job } => {
  return schedule.scheduledJobs
}

const getJobList = (): ScheduleJob[] => {
  const result: ScheduleJob[] = []
  const data = db.schedule.values()
  data.forEach((value) => {
    result.push({ ...value, hasJob: !!schedule.scheduledJobs[value.id] })
  })
  return result
}

export {
  createJob,
  cancelJob,
  hasJob,
  getJob,
  getScheduleJobs,
  getJobList,
  deleteJob,
  toggleJob,
  runJob
}

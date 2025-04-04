// socket 事件
type SocketEvent = {
  id: string
  name: string
  color: string
  event: string
  eventData: EventData
}

type EventData = {
  x: number
  y: number
  button: number
  double: boolean
}

type Pos = {
  x: number
  y: number
}

// 任务计划
type ScheduleJob = SocketEvent & {
  cron: string
  // Job是否存在
  hasJob: boolean
  // 创建后立即执行
  runOnCreate: boolean
  // 应用启动时执行
  runOnStart: boolean
}
// 窗口信息
type WindowInfo = {
  id: number
  title: string
  appName: string
  x: number
  y: number
  width: number
  height: number
  isMaximized: boolean
  isMinimized: boolean
}

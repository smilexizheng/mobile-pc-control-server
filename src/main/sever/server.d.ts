// socket执行时间
type Event1 = {
  // 事件名称
  event: string
  // 事件数据
  eventData: EventData
  // 延迟执行
  delay: number
}

type EventData = {
  x?: number
  y?: number
  button?: number
  double?: boolean
  url?: string
}

// socket 事件
type SocketEvent = {
  id: string
  name: string
  color: string
  // event events二选一
  event?: string
  eventData?: EventData
  // events 二选一
  events?: Array<Event1>
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

//聊天和客户端相关
type ClientInfo = {
  // socket.io id
  id: string
  // 自定义名称
  name?: string
  // 连接时间
  connectTime: Date
  // ua信息
  userAgent: UAParser.IResult
  // 客户端IP
  clientIp: string
}

// 消息互动
type ChatMessage = {
  form?: string
  to: string
  group?: string
  msgType: 'txt' | 'file' | 'image'
  content: string | object | Buffer
}

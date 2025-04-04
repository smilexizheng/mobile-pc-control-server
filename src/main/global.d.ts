declare global {
  namespace Electron {
    interface App {
      willQuitApp: boolean
    }
  }
}

export {}

declare module 'node-schedule' {
  interface Job {
    /**
     * 从调度中删除任务
     */
    deleteFromSchedule(): void
    // 是否创建了任务
    hasJob: boolean
    // id
    id: string
  }
}

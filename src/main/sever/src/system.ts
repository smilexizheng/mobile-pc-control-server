import { exec } from 'child_process'

const shutdown = (): void => {
  console.log('执行关机命令')
  exec('shutdown /s /t 0', (error) => {
    if (error) {
      console.error('关机失败:', error)
      return
    }
  })
}

export { shutdown }

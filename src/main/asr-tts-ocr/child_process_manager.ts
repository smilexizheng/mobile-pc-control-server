// https://github.com/l1veIn/lol-wom-electron/blob/main/src/utils/child_process_manager.js
// import { fork, ForkOptions, ChildProcess } from 'child_process'
import EventEmitter from 'events'
import { utilityProcess, UtilityProcess, ForkOptions } from 'electron'

interface ChildProcessManagerOptions {
  maxRestarts?: number
  restartDelay?: number
  args?: string[]
  forkOptions?: ForkOptions
}

class ChildProcessManager extends EventEmitter {
  private readonly scriptPath: string
  private options: Required<ChildProcessManagerOptions>
  private childProcess: UtilityProcess | null = null
  private restartCount: number = 0
  private isShuttingDown: boolean = false

  constructor(scriptPath: string, options: ChildProcessManagerOptions = {}) {
    super()
    this.scriptPath = scriptPath
    this.options = {
      maxRestarts: 5,
      restartDelay: 5000,
      args: [],
      forkOptions: {},
      ...options
    }
  }

  start(): void {
    if (this.childProcess) {
      this.emit('warning', 'Child process already running')
      return
    }
    this.createProcess()
  }

  exist(): boolean {
    return !!this.childProcess
  }

  private createProcess(): void {
    this.childProcess = utilityProcess.fork(
      this.scriptPath,
      this.options.args,
      this.options.forkOptions
    )

    this.childProcess.on('error', (e) => {
      // this.emit('error', error)
      console.error(e)
      this.handleProcessFailure('error')
    })

    this.childProcess.on('exit', (code: number) => {
      this.emit('exit', code)
      if (code !== 0 && !this.isShuttingDown) {
        this.handleProcessFailure('exit')
      }
    })

    this.childProcess.on('message', (message) => {
      this.emit('message', message)
    })

    this.emit('started')
  }

  private handleProcessFailure(reason: string): void {
    if (this.restartCount < this.options.maxRestarts) {
      this.restartCount++
      console.error(this.restartCount, '尝试重启', this.scriptPath)
      this.emit('restarting', { reason, attempt: this.restartCount })
      setTimeout(() => this.createProcess(), this.options.restartDelay)
    } else {
      this.emit('max-restarts-reached')
    }
  }

  send(message): void {
    if (this.childProcess) {
      // this.childProcess.send(message)
      process.parentPort.postMessage(message)
    } else {
      this.emit('warning', 'Attempted to send message to non-existent child process')
    }
  }

  stop(): void {
    if (this.childProcess) {
      this.isShuttingDown = true
      this.childProcess.removeAllListeners()
      this.childProcess.kill()
      this.childProcess = null
      this.emit('stopped')
    }
  }

  restart(): void {
    this.stop()
    this.restartCount = 0
    this.isShuttingDown = false
    setTimeout(() => this.start(), 1000)
  }
}

export default ChildProcessManager

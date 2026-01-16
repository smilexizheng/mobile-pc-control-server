import { exec } from 'child_process'
import iconv from 'iconv-lite'
import { CLIENT_EMIT_EVENTS as CE } from './constant/client-emit'

const shutdown = (data, socket): void => {
  console.log(data)
  let arg = '-s -t 0'
  switch (data.type) {
    case 'now':
      arg = '-s -t 0'
      break
    case 'sleep':
      arg = '-h'
      break
    case 'reboot':
      arg = '-r -t 0'
      break
    case 'time':
      arg = `-s -t ${data.time}`
      break
    default:
      break
  }
  console.log(`执行关机命令: shutdown ${arg}`)
  exec(`shutdown ${arg}`, { encoding: 'buffer' }, (error, _, stderr) => {
    const stderrMsg = iconv.decode(stderr, 'gbk')
    if ((error || stderr) && socket) {
      socket.emit(CE.RESPONSE, { success: false, msg: error || stderrMsg })
    }
  })
}

const execShell = (data, socket): void => {
  console.log(`执行自定义命令: ${data.cmd}`)
  exec(`${data.cmd}`, { encoding: 'buffer' }, (error, _, stderr) => {
    const stderrMsg = iconv.decode(stderr, 'gbk')
    if ((error || stderr) && socket) {
      socket.emit(CE.RESPONSE, { success: false, msg: error || stderrMsg })
    }
  })
}

export { shutdown, execShell }

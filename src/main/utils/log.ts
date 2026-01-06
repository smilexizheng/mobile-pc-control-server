import log from 'electron-log/main'
import upath from 'upath'
import { is } from '@electron-toolkit/utils'
Object.assign(console, log.functions)
log.initialize()
log.transports.file.level = is.dev ? 'info' : 'error'
log.transports.file.maxSize = 1002430
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
let date: Date | string = new Date()
date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
log.transports.file.resolvePathFn = (): string => upath.join('logs', `${date}.log`)

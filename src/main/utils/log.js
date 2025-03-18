import log from 'electron-log/main';
import upath from "upath";
log.initialize();
log.transports.file.level = 'debug'
log.transports.file.maxSize = 1002430
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
let date = new Date()
date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
log.transports.file.resolvePathFn = () =>upath.join(process.cwd(), 'logs',`${date}.log`);
Object.assign(console, log.functions);



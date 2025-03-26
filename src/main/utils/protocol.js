import {app} from "electron";
import * as path from "path";

const PROTOCOL = 'cse';
const initProtocol = () => {
  // Windows 第一个实例触发
  handleArgv(process.argv);

  const args = [];
  if (!app.isPackaged) {
    args.push(path.resolve(process.argv[1]));
  }

  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);



// macOS 下通过协议URL启动时，主实例会通过 open-url 事件接收这个 URL
  app.on('open-url', (event, urlStr) => {
    handleUrl(urlStr);
  });
}



// Windows
const handleArgv = (argv)=> {
  const prefix = `${PROTOCOL}:`;
  // 开发阶段，跳过前两个参数（`electron.exe .`）
  // 打包后，跳过第一个参数（`myapp.exe`）
  const offset = app.isPackaged ? 1 : 2;
  const url = argv.find((arg, i) => i >= offset && arg.startsWith(prefix));
  if (url) handleUrl(url);
}

const handleUrl = (urlStr) => {
  const urlObj = new URL(urlStr);
  const {searchParams} = urlObj;
  console.log("searchParams", searchParams)
}

export  {initProtocol,handleArgv,handleUrl};

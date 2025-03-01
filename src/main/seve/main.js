import {createServer} from 'http';
import {Server} from "socket.io";
import {registerSocketHandlers} from "./src/socketEvent.js";
import {CLIENT_ON_EVENTS as CO} from "./src/constant/client-on.js";
import {getScreenInfo} from "./src/system.js";
import startWebServer from "./src/webServer.js";


const InitWinControlServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    // options
  });
  getScreenInfo();

  startWebServer();
  registerSocketHandlers(io);

// 启动服务器
  httpServer.listen(3000, () => {
    console.log('WebSocket service Keyboard running on port 3000');
  });

}

export {InitWinControlServer}

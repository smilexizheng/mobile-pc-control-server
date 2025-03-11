import {createServer} from 'http';
import {Server} from "socket.io";
import {registerSocketHandlers} from "./src/socketEvent.js";
import startWebServer from "./src/webServer.js";

const InitWinControlServer = () => {

  const httpServer = createServer();
  const io = new Server(httpServer, {
    path: "/win-control.io"
    // options
  });

  startWebServer();
  registerSocketHandlers(io);

// 启动服务器
  httpServer.listen(3000, () => {
    console.log('WebSocket service Keyboard running on port 3000');
  });

}

export {InitWinControlServer}

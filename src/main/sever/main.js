import {createServer} from 'http';
import {Server} from "socket.io";
import {registerSocketHandlers} from "./src/socketEvent.js";
import startWebServer from "./src/webServer.js";

const InitWinControlServer = () => {
  // robot.screen.capture(0, 0, 400, 300);

  const httpServer = createServer();
  const io = new Server(httpServer, {
    path: "/win-control.io"
    // options
  });
  // getScreenInfo();
  //
  startWebServer();
  registerSocketHandlers(io);

// 启动服务器
  httpServer.listen(3000, () => {
    console.log('WebSocket service Keyboard running on port 3000');
  });

}

export {InitWinControlServer}

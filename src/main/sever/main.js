import {createServer} from 'http';
import {Server} from "socket.io";
import {registerSocketHandlers} from "./src/socketEvent.js";
import startWebServer from "./src/webServer.js";
import express from "express";

const InitWinControlServer = () => {
  const webExpress = express();
  const httpServer = createServer(webExpress);
  startWebServer(webExpress);
  const io = new Server(httpServer, {
    path: "/win-control.io"
    // options
  });
  registerSocketHandlers(io);

// 启动服务器
  httpServer.listen(3000, () => {
    console.log('WebSocket service Keyboard running on port 3000');
  });

}

export {InitWinControlServer}

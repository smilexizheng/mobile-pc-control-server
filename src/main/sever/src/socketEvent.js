import {keyPressHandle, keyToggleHandle, openAppHandler, openUrlHandler, typeString} from "./control.js";
import {shutdown} from "./system.js";
import {getVol, setVol, toggleVolMute} from "./volume.js";
import {CLIENT_EMIT_EVENTS as CE} from "./constant/client-emit.js";
import {sendHeader, stopScreenLive} from "./utils/ffmpeg_captrue.js";
import {Window} from 'node-screenshots'
import {getMousePos, grabRegion, mouseClick, mouseToggle} from "./core.js";
import { mouse} from "@nut-tree-fork/nut-js";
import {TransferFile} from "./TransferFile";


const registerSocketHandlers = (io) => {

  // 前端触摸时的pos
  let touchPos = null;
  let mobileScreenSize = {width: 400, height: 800};
  io.on('connection', (socket) => {

    TransferFile(socket)
    socket.emit(CE.RESPONSE, {success: true, msg: 'client connected'});

    // 保存原始的 on 方法
    const originalOn = socket.on;
    // 覆盖 socket.on 方法
    socket.on = function (eventName, listener) {
      // 包装监听器，添加错误捕获
      const wrappedListener = async (...args) => {
        try {
          await listener.apply(this, args);
        } catch (error) {
          // 全局错误处理
          console.error(error, eventName, socket);
          socket.emit(CE.RESPONSE, {
            success: false,
            msg: error.message,
            event: eventName,
            time: Date.now() - socket.data[`${eventName}-time`]
          });
        } finally {
          // todo 某些事件不需要提示
          socket.emit(CE.RESPONSE, {
            success: true,
            event: eventName,
            time: Date.now() - socket.data[`${eventName}-time`]
          });
        }
      };
      // 注册包装后的监听器
      return originalOn.call(this, eventName, wrappedListener);
    };


    // 监听所有入口事件
    socket.onAny((event, ...args) => {
      // console.log(`goto ${event}`);
      socket.data[`${event}-time`] = Date.now();
    });

    // 监听所有出口事件
    socket.onAnyOutgoing((event, ...args) => {
      // console.log(`outgoing ${event}`);
    });

    // 屏幕直播 flv获取流的头部信息
    socket.on(CE.GET_SCREEN_STREAM_HEADER, () => {
      sendHeader(io, socket)
    });
    // socket.io事件监听注册
    socket.on(CE.JOIN_ROOM, (data) => {
      socket.join(data.roomName);
    });
    // 离开房间
    socket.on(CE.LEAVE_ROOM, (data) => {
      socket.leave(data.roomName);
    });

    // 设置屏幕尺寸
    socket.on(CE.MOBILE_SCREEN_SIZE, async (data) => {
      mobileScreenSize = {width: Math.round(data.screenSize.width), height: Math.round(data.screenSize.height)};
      // TODO 处理多人同时操作屏幕尺寸问题
      socket.data.mobileScreenSize = {...mobileScreenSize};
      socket.emit(CE.SYS_POINTER_POS, await getMousePos())
    })

    // 键
    socket.on(CE.TYPING, typeString);
    socket.on(CE.KEYPRESS, keyPressHandle);
    socket.on(CE.KEY_TOGGLE, keyToggleHandle);
    socket.on(CE.SYS_MOUSE_MOVE, keyPressHandle);
    socket.on(CE.OPEN_URL, openUrlHandler);
    socket.on(CE.OPEN_APP, openAppHandler);

    // 系统
    socket.on(CE.SYS_SHUTDOWN, shutdown);
    socket.on(CE.SYS_SET_VOLUME, async (d) => {
      await setVol(d, socket)
    });
    socket.on(CE.SYS_GET_VOLUME, async () => {
      await getVol(socket)
    });
    socket.on(CE.SYS_TOGGLE_MUTE, async (d) => {
      await toggleVolMute(d, socket)
    });


    //鼠标指针
    socket.on(CE.SYS_MOUSE_CLICK, async (data) => {
      console.log("点击鼠标",data.double)
      await mouseClick(data.button, data.double);

    });

    socket.on(CE.SYS_MOUSE_TOGGLE, async (data) => {
      await mouseToggle(data.isPress, data.button);
    });

    socket.on(CE.SYS_SCROLL_VERTICAL, async (delta) => {
      delta ? await mouse.scrollUp(120) : await mouse.scrollDown(120)
    });


    socket.on(CE.SYS_SCROLL_HORIZONTAL, async (delta) => {
      delta ? await mouse.scrollLeft(120) : await mouse.scrollRight(120)
    });


    // 前端触摸 记录指针位置
    socket.on(CE.SYS_POINTER_START, async () => {
      touchPos = await getMousePos();
      socket.emit(CE.SYS_POINTER_POS, touchPos)
    });
    socket.on(CE.SYS_POINTER_MOVE, async (data) => {
      let nowPos;
      if (!data.touchMove) {
        nowPos = {x: data.x, y: data.y}
      } else if(touchPos) {
        nowPos = {x: touchPos.x + data.x, y: touchPos.y + data.y}
      }
      if(nowPos){
        await  mouse.move([nowPos])
      }

    });

    socket.on(CE.SYS_POINTER_END, async () => {
      console.log("结束鼠标")
      socket.emit(CE.SYS_POINTER_POS, await getMousePos())
    });


    socket.on(CE.WINDOW_LIST, async ()=>{
      const window = Window.all();
      const windowList = [];
      window.forEach((item) => {
        windowList.push({
          id: item.id,
          title: item.title,
          appName: item.appName,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          isMaximized: item.isMaximized,
          isMinimized: item.isMinimized,
        });

        // let image = item.captureImageSync();
        // fs.writeFileSync(`${item.id}-sync.bmp`, image.toBmpSync());
        //
        // item.captureImage().then(async (data) => {
        //   console.log(data);
        //   let newImage = await data.crop(10, 10, 10, 10);
        //   fs.writeFileSync(`${item.id}.png`, await newImage.toPng());
        });
      console.log(windowList)
      socket.emit(CE.WINDOW_LIST,  windowList)
      });

    socket.on(CE.WINDOW_IMG,  (windowId)=>{
      const window = Window.all();
      const buffer=window.find(s=>s.id===windowId).captureImageSync().toPngSync()
      socket.emit(CE.WINDOW_IMG,  buffer)
    });


    // 处理客户端断开连接
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });


    socket.on(CE.FILE_TRANSFER, async (data) => {
      console.log(data);


    })



  });


// 配置参数优化
  const config = {
    scale: 1,          // 分辨率缩放比例（从 100% 降至 50%）
    quality: 10,         // JPEG质量降至可接受范围
  };
  const captureInterval = 18; // 截图间隔（毫秒）

  let isCapture = false;
  let mousePos = {};
  const captureScreen = async (cutSize = {width: 400, height: 800}, force) => {
    if (!io.sockets.adapter.rooms.has("screen")) return
    if (isCapture && !force) return;
    try {
      isCapture = true
      const now = Date.now()
      const pos = await getMousePos()
      // TODO
      // if (touchPos.x === mousePos.x && touchPos.y === mousePos.y) return;
      mousePos = pos;


      const img = await grabRegion(mousePos.x,
        mousePos.y,
        cutSize.width,
        cutSize.height);
      // console.log('处理图像耗时:', Date.now() - now, img.buffer.length)


      // zlib.gzip(img.buffer, (err, compressedBuffer) => {
      //   if (err) throw err;
      //   console.log('压缩:', Date.now() - now, compressedBuffer.length)
      // });

      // const compressedBuffer = zlib.gzipSync(img.buffer,{level:8});
      // console.log('压缩耗时:', Date.now() - now, compressedBuffer.length)
      // const compressionRatio = (1 - compressedBuffer.length / img.buffer.length) * 100;
      // console.log(`压缩率: ${compressionRatio.toFixed(2)}%`);

      // zlib.deflate(img.buffer, (err, compressedBuffer) => {
      //   if (!err) {
      //     console.log('压缩耗时:', Date.now() - now, compressedBuffer.length)
      //   }
      // });


      // 发送 Base64 图像数据
      io.to('screen').emit('screen-data', {
        ...img,
        time: Date.now() - now,
        width: cutSize.width * config.scale,
        height: cutSize.height * config.scale,
      });
      io.to('screen').emit(CE.SYS_POINTER_POS, mousePos)
    } catch (error) {
      console.error('截图失败:', error);
    } finally {
      isCapture = false
    }
  }


  setInterval(async () => {
    if (isCapture) return;
    await captureScreen(mobileScreenSize)
  }, captureInterval);

  // const screenLive = io.of('/screenLive');
  // screenLive.on('connection', (socket) => {
  //     console.log('screenLive client', socket.id)
  // })
  // screenLive.emit('an event sent to all connected clients in chat namespace')
  // 启用桌面推送
  // startScreenLive(io)




  io.of("/").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
  });

  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined  ${room}`);

  });

  io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`socket ${id} has leave  ${room}`);
  });
  io.of("/").adapter.on("delete-room", (room, id) => {
    console.log(`socket ${id} has delete  ${room}`);
    if (room === "screenlive") {
      stopScreenLive();
    }
  });


};

export {registerSocketHandlers} ;

import {keyPressHandle, keyToggleHandle, openAppHandler, openUrlHandler, typeString, withResponse} from "./control.js";
import { shutdown} from "./system.js";
import {getVol, setVol, toggleVolMute} from "./volume.js";
import {CLIENT_EMIT_EVENTS as CE} from "./constant/client-emit.js";
import {CLIENT_ON_EVENTS as CO} from "./constant/client-on.js";
import {WinApi} from "./utils/win-api.js"
import {sendHeader,  stopScreenLive} from "./utils/ffmpeg_captrue.js";

import {getMousePos, mouseClick, mouseToggle, grabRegion} from "./core.js";


const registerSocketHandlers = (io) => {

    // 前端触摸时的pos
    let touchPos = null;
    // 更新系统的指针位置
    let nowPos = null;
    let mobileScreenSize = {width: 400, height: 800};
    io.on('connection', (socket) => {

        socket.emit(CO.RESPONSE, {success: true, msg: 'client connected'});

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
                    socket.emit(CO.RESPONSE, {
                        success: false,
                        msg: error.message,
                        event: eventName,
                        time: Date.now() - socket.data[`${eventName}-time`]
                    });
                } finally {
                    // todo 某些事件不需要提示
                    socket.emit(CO.RESPONSE, {
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
            mobileScreenSize = data.screenSize;
            // TODO 处理多人同时操作屏幕尺寸问题
            socket.data.mobileScreenSize = data.screenSize;
            socket.emit(CO.SYS_POINTER_POS, await getMousePos())
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
        socket.on(CE.SYS_SET_VOLUME, async (d)=>{await setVol(d,socket)});
        socket.on(CE.SYS_GET_VOLUME, async ()=>{await getVol(socket)});
        socket.on(CE.SYS_TOGGLE_MUTE,  async(d)=>{await toggleVolMute(d,socket)});


        //鼠标指针
        socket.on(CE.SYS_MOUSE_CLICK, async (data) => {
            console.log("点击鼠标")
            await mouseClick(data.button, data.double);

        });

        socket.on(CE.SYS_MOUSE_TOGGLE, async (data) => {
            await mouseToggle(data.isPress, data.button);
        });

        socket.on(CE.SYS_SCROLL_VERTICAL, (delta) => {
            WinApi.scrollVertical(delta ? 120 : -120);

        });


        socket.on(CE.SYS_SCROLL_HORIZONTAL, (delta) => {
            WinApi.scrollHorizontal(delta ? 120 : -120);
        });


        // 前端触摸 记录指针位置
        socket.on(CE.SYS_POINTER_START, async () => {
            touchPos = await getMousePos();
            socket.emit(CO.SYS_POINTER_POS, touchPos)
        });
        socket.on(CE.SYS_POINTER_MOVE, (data) => {
            if (!touchPos) {
                nowPos = {x: data.x, y: data.y}
            } else {
                nowPos = {x: touchPos.x + data.x, y: touchPos.y + data.y}
            }
            console.log("移动鼠标", nowPos)
            WinApi.moveMouse(nowPos.x, nowPos.y);
            captureScreen(mobileScreenSize).then();
        });

        socket.on(CE.SYS_POINTER_END, async () => {
            console.log("结束鼠标")
            // captureScreen(mobileScreenSize,true).then();
            socket.emit(CO.SYS_POINTER_POS, await getMousePos())
            touchPos = null
            nowPos = null
        });

        // 处理客户端断开连接
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

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
            console.log('处理图像耗时:', Date.now() - now, img.buffer.length)

            // 发送 Base64 图像数据
            io.to('screen').emit('screen-data', {
                time: Date.now() - now,
                image: img.buffer,
                width: cutSize.width * config.scale,
                height: cutSize.height * config.scale,
                left: img.left,
                top: img.top,
                right: img.right,
                bottom: img.bottom
            });
            io.to('screen').emit(CO.SYS_POINTER_POS, mousePos)
        } catch (error) {
            console.error('截图失败:', error);
        } finally {
            isCapture = false
        }
    }


    setInterval(async () => {
        if (touchPos || isCapture) return;
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

import {keyPressHandle, keyToggleHandle, openAppHandler, openUrlHandler, typeString, withResponse} from "./control.js";
import {getScreenInfo, shutdown} from "./system.js";
import {getVol, setVol, toggleVolMute} from "./volume.js";
import {CLIENT_EMIT_EVENTS as CE} from "./constant/client-emit.js";
import {CLIENT_ON_EVENTS as CO} from "./constant/client-on.js";
import sharp from "sharp";
import robot from "robotjs";
import {WinApi} from "./utils/win-api.js"
import {sendHeader, startScreenLive, stopScreenLive} from "./utils/ffmpeg_captrue.js";



const registerSocketHandlers = (io) => {

    // 前端触摸时的pos
    let touchPos = null;
    // 更新系统的指针位置
    let nowPos = null;
    let mobileScreenSize = {width: 400, height: 800};
    io.on('connection', (socket) => {

        socket.emit(CO.RESPONSE, {success: true, msg: 'client connected'});

        // 屏幕直播 flv获取流的头部信息
        socket.on(CE.GET_SCREEN_STREAM_HEADER, ()=>{
            sendHeader(io,socket)
        });
        // socket.io事件监听注册
        socket.on(CE.JOIN_ROOM, (data)=>{
            socket.join(data.roomName);
        });

        socket.on(CE.LEAVE_ROOM, (data)=>{
            socket.leave(data.roomName);
        });


        socket.on(CE.MOBILE_SCREEN_SIZE,(data)=>{
            mobileScreenSize = data.screenSize;
            socket.emit(CO.SYS_POINTER_POS, robot.getMousePos())
        })

        // 键
        socket.on(CE.TYPING, withResponse(typeString, socket));
        socket.on(CE.KEYPRESS, withResponse(keyPressHandle, socket));
        socket.on(CE.KEY_TOGGLE, withResponse(keyToggleHandle, socket));
        socket.on(CE.SYS_MOUSE_MOVE, withResponse(keyPressHandle, socket));
        socket.on(CE.OPEN_URL, withResponse(openUrlHandler, socket));
        socket.on(CE.OPEN_APP, withResponse(openAppHandler, socket));

        // 系统
        socket.on(CE.SYS_SHUTDOWN, withResponse(shutdown, socket));
        socket.on(CE.SYS_SET_VOLUME, withResponse(setVol, socket));
        socket.on(CE.SYS_GET_VOLUME, withResponse(getVol, socket));
        socket.on(CE.SYS_TOGGLE_MUTE, withResponse(toggleVolMute, socket));


        //鼠标指针
        socket.on(CE.SYS_MOUSE_CLICK, (data) => {
            console.log("点击鼠标")
            robot.mouseClick(data.button, data.double);
        });

        socket.on(CE.SYS_MOUSE_TOGGLE, (data) => {
            robot.mouseToggle(data.down, data.button);
        });

        socket.on(CE.SYS_SCROLL_VERTICAL, (delta) => {
            WinApi.scrollVertical(delta?120:-120);

        });


        socket.on(CE.SYS_SCROLL_HORIZONTAL, (delta) => {
            WinApi.scrollHorizontal(delta?120:-120);
        });


        // 前端触摸 记录指针位置
        socket.on(CE.SYS_POINTER_START, () => {
            touchPos = robot.getMousePos();
            socket.emit(CO.SYS_POINTER_POS, touchPos)
        });
        socket.on(CE.SYS_POINTER_MOVE,  (data) => {
            console.log("移动鼠标",touchPos)
            if (!touchPos) {
                nowPos = {x:data.x, y: data.y}
            }else{
                nowPos = {x:touchPos.x + data.x, y: touchPos.y + data.y}
            }
            WinApi.moveMouse(nowPos.x, nowPos.y);
            captureScreen(mobileScreenSize).then();
        });

        socket.on(CE.SYS_POINTER_END, () => {
            console.log("结束鼠标")
            // captureScreen(mobileScreenSize,true).then();
            touchPos = null
            nowPos=null
        });

        // 处理客户端断开连接
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

    });






// 配置参数优化
    const config = {
        scale: 1,          // 分辨率缩放比例（从 100% 降至 50%）
        quality: 100,         // JPEG质量降至可接受范围
    };
    const captureInterval = 30; // 截图间隔（毫秒）

    let isCapture = false;
    let mousePos = {};
    const captureScreen = async (cutSize={width: 400, height: 800},force) => {
        if(!io.sockets.adapter.rooms.has("screen")) return
        if(isCapture && !force) return;
        try {
            isCapture= true
            const now = Date.now()
            const pos= robot.getMousePos()
            // TODO
            // if (touchPos.x === mousePos.x && touchPos.y === mousePos.y) return;
            mousePos = pos;



            // console.log('指针位置耗时:',Date.now() - now)
            const rawImg = robot.screen.capture(mousePos.x - cutSize.width/2, mousePos.y - cutSize.height/2, cutSize.width, cutSize.height);

            // console.log('获取屏幕截图耗时:',Date.now() - now)
            // 2. 使用 sharp 流水线处理
            const processedBuffer = await sharp(rawImg.image, {
                raw: {
                    width: rawImg.width,
                    height: rawImg.height,
                    channels: 4 // BGRA 四通道
                }
            })
                .recomb([
                    [0, 0, 1, 0],  // B -> R
                    [0, 1, 0, 0],  // G -> G
                    [1, 0, 0, 0],  // R -> B
                    [0, 0, 0, 1]   // A -> A
                ])
                .toFormat('jpg', {
                    quality: config.quality,
                })
                .toBuffer();
            // console.log('处理图像耗时:',Date.now() - now,processedBuffer.length,rawImg.image.length)
            // 发送 Base64 图像数据
            io.to('screen').emit('screen-data', {
                time: Date.now() - now,
                image: processedBuffer,
                width: cutSize.width * config.scale,
                height: cutSize.height * config.scale,
            });
            io.to('screen').emit(CO.SYS_POINTER_POS, mousePos)
        } catch (error) {
            console.error('截图失败:', error);
        }finally {
            isCapture= false
        }
    }


    setInterval(async () => {
        if(touchPos || isCapture) return;
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
        if(room==="screenlive"){
            stopScreenLive();
        }
    });




};

export {registerSocketHandlers} ;
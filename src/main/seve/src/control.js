import robot from "robotjs";
import {spawn} from 'child_process';
// import clipboard from 'clipboardy';
import {CLIENT_ON_EVENTS as CO} from "./constant/client-on.js";

const withResponse = (handler, socket) => async (data) => {
    const now = Date.now()
    try {
        await handler(data, socket);
        socket.emit(CO.RESPONSE, {success: true, time: Date.now() - now});
    } catch (err) {
        socket.emit(CO.RESPONSE, {
            success: false,
            time: Date.now() - now,
            msg: err.message  // 统一错误消息字段为msg
        });
    }
};


// 参数校验函数
const validateParams = (data, fields) => {
    const missingParams = fields.filter(field => !data[field]);
    if (missingParams.length > 0) {
        throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }
};

const keyPressHandle = async (data) => {
    validateParams(data, ['key']);  // 假设需要key参数
    let modifierKeys = [];
    if (data.modifier !== undefined && data.modifier !== '') {
        modifierKeys = data.modifier.split('+').map(m => m.toLowerCase());
    }

    if (modifierKeys.length > 0) {
        robot.keyTap(data.key, modifierKeys);
    } else {
        robot.keyTap(data.key);
    }
};


const keyToggleHandle = async (data) => {
    validateParams(data, ['key']);  // 假设需要key参数
    let modifierKeys = [];
    if (data.modifier !== undefined && data.modifier !== '') {
        modifierKeys = data.modifier.split('+').map(m => m.toLowerCase());
    }
    console.log(data)
    robot.keyToggle(data.key, data.down);
    // robot.keyToggle('a', 'down',[]);
};

const openUrlHandler = (data) => {
    validateParams(data, ['url']);
    openUrl(data.url);  // 假设open返回Promise
};

const openAppHandler = async (data) => {
    // todo 打开系统应用
    // validateParams(data, ['name']);
    // await openApp(data.name);  // 假设openApp返回Promise
};


const typeString = async (data) => {
    console.log(data)
    // clipboard.writeSync(data.val);
    robot.keyTap("v", ['control']);

    if (data.enter) {
        robot.keyTap("enter");
    }

    // clipboard.writeSync(' ');

};


const openUrl = (url) => {
    const subprocess = spawn('cmd.exe', ['/c', 'start', '""', url], {
        detached: true,    // 让子进程独立
        stdio: 'ignore',   // 忽略 IO
        windowsHide: true
    });
    subprocess.unref();
}


const appsHandler = async (data) => {
    // 处理腾讯视频网页的操作逻辑
    robot.moveMouse(1260, 570);
    robot.moveMouse(1760, 970);
    robot.mouseClick('left');
}




const pointerMove = async (data) => {
    // 处理腾讯视频网页的操作逻辑
    robot.moveMouse(1260, 570);
    robot.moveMouse(1760, 970);
    robot.mouseClick('left');
}


export {withResponse, openAppHandler, openUrlHandler, keyPressHandle, typeString, keyToggleHandle} ;

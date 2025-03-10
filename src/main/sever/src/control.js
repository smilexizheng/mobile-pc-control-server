import {spawn} from 'child_process';
import {CLIENT_ON_EVENTS as CO} from "./constant/client-on.js";
import {clipboard, Key, keyboard} from "@nut-tree-fork/nut-js";
keyboard.config.autoDelayMs=0;
const withResponse = (handler, socket) => async (data) => {
    const now = Date.now()
    try {
        await handler(data, socket);
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
    // console.log(typeof  data.key)
    if(typeof  data.key === 'number'){
        await keyboard.type(data.key)
    }else{
        await keyboard.pressKey(...data.key);
        await keyboard.releaseKey(...data.key);
    }

};


const keyToggleHandle = async (data) => {
    console.log(data)
    validateParams(data, ['key']);  // 假设需要key参数
    data.down ? await keyboard.pressKey(...data.key): await keyboard.releaseKey(...data.key);
};

const openUrlHandler = (data) => {
    validateParams(data, ['url']);
    openUrl(data.url);  // 假设open返回Promise
};

const openAppHandler = async (data) => {
    // todo 打开系统应用
    console.error("暂不支持打开系统应用")
    // validateParams(data, ['name']);
    // await openApp(data.name);  // 假设openApp返回Promise
};


/**
 * 自动输入前端输出内容
 * @param data
 * @returns {Promise<void>}
 */
const typeString = async (data) => {
    await clipboard.setContent(data.val);
    await keyboard.pressKey(Key.LeftControl, Key.V);
    await keyboard.releaseKey(Key.LeftControl, Key.V);
    if (data.enter) {
        await keyboard.type(Key.Enter)
    }
    await clipboard.setContent(' ');

};


const openUrl = (url) => {
    const subprocess = spawn('cmd.exe', ['/c', 'start', '""', url], {
        detached: true,    // 让子进程独立
        stdio: 'ignore',   // 忽略 IO
        windowsHide: true
    });
    subprocess.unref();
}





export {withResponse, openAppHandler, openUrlHandler, keyPressHandle, typeString, keyToggleHandle} ;
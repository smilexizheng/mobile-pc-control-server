import {getVolume, isMute, setVolume, toggleMute} from "./utils/sys-volume.js";
import {CLIENT_ON_EVENTS as CO}  from "./constant/client-on.js";

// 设置音量
const getVol = async (socket) => {
    socket.emit(CO.SYS_VOLUME, {success: true, data:{volume: await getVolume(), mute: await isMute()}});
};

const setVol = async (data, socket) => {
    await setVolume(data)
    await getVol(socket);
};



const toggleVolMute = async (data,socket) => {
    await toggleMute();
    await getVol(socket)
};

export { getVol, setVol,  toggleVolMute }

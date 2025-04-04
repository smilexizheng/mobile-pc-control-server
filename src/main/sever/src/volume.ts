import { getVolume, isMute, setVolume, toggleMute } from './utils/sys-volume'
import { CLIENT_EMIT_EVENTS as CE } from './constant/client-emit.js'

// 设置音量
const getVol = async (socket): Promise<void> => {
  socket.emit(CE.SYS_VOLUME, {
    success: true,
    data: { volume: await getVolume(), mute: await isMute() }
  })
}

const setVol = async (data, socket): Promise<void> => {
  await setVolume(data)
  await getVol(socket)
}

const toggleVolMute = async (_, socket): Promise<void> => {
  await toggleMute()
  await getVol(socket)
}

export { getVol, setVol, toggleVolMute }

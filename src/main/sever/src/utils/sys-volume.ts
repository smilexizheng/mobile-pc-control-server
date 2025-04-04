import loudness from 'loudness'

// 设置音量（0~100）
const setVolume = async (volume: number): Promise<void> => {
  try {
    await loudness.setVolume(volume)
    console.log(`音量已设置为 ${volume}%`)
  } catch (err) {
    console.error('设置音量失败:', err)
  }
}

// 获取当前音量
const getVolume = async (): Promise<number> => {
  return await loudness.getVolume()
}

// 静音/取消静音
const toggleMute = async (): Promise<void> => {
  try {
    const isMuted = await loudness.getMuted()
    await loudness.setMuted(!isMuted)
    console.log(`已${isMuted ? '取消静音' : '静音'}`)
  } catch (err) {
    console.error('切换静音失败:', err)
  }
}

// 静音/取消静音
const isMute = async (): Promise<boolean> => {
  return await loudness.getMuted()
}

export { setVolume, getVolume, toggleMute, isMute }

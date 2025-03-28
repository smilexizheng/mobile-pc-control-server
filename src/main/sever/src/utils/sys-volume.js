import loudness from'loudness';




// 设置音量（0~100）
const setVolume = async (volume) =>{
    try {
        await loudness.setVolume(volume.toFixed(0));
        console.log(`音量已设置为 ${volume}%`);
    } catch (err) {
        console.error('设置音量失败:', err);
    }
}

// 获取当前音量
const getVolume = async () =>{
    try {
        const vol = await loudness.getVolume();
        console.log(`当前音量: ${vol}%`);
        return vol;
    } catch (err) {
        console.error('获取音量失败:', err);
    }
}

// 静音/取消静音
const toggleMute = async () =>{
    try {
        const isMuted = await loudness.getMuted();
        await loudness.setMuted(!isMuted);
        console.log(`已${isMuted ? '取消静音' : '静音'}`);
    } catch (err) {
        console.error('切换静音失败:', err);
    }
}


// 静音/取消静音
const isMute = async () =>{
    try {
        return  await loudness.getMuted();
    } catch (err) {
        console.error('是否静音状态获取失败:', err);
    }
}




export {setVolume, getVolume, toggleMute, isMute}
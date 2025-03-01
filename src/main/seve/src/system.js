import si from'systeminformation';
import {exec} from 'child_process';

const shutdown  = () => {
    exec('shutdown /s /t 0', (error, stdout, stderr) => {
        if (error) {
            console.error('关机失败:', error);
            return;
        }
        console.log('关机命令已执行');
    });
}


const getScreenInfo = async() => {
    try {
        const graphics = await si.graphics();
        graphics.displays.forEach(display => {
            console.log(`显示器:`);
            console.log(JSON.stringify(display));
            // console.log(`分辨率: ${display.resolutionX}x${display.resolutionY}`);
            // console.log(`当前分辨率: ${display.currentResX}x${display.currentResY}`);
        });

        return graphics;
    } catch (e) {
        console.error(e);
        return null
    }

}



export { getScreenInfo ,shutdown}
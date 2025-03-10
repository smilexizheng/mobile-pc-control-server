import si from'systeminformation';
import {exec} from 'child_process';
import screenshot from "screenshot-desktop";

const shutdown  = () => {
    exec('shutdown /s /t 0', (error, stdout, stderr) => {
        if (error) {
            console.error('关机失败:', error);
            return;
        }
        console.log('关机命令已执行');
    });
}


/**
 * Systeminformation 获取屏幕信息
 * @returns {Promise<Systeminformation.GraphicsDisplayData[]|null>}
 */
const getScreenInfo = async() => {
    try {
        const graphics = await si.graphics();

        // graphics.displays.forEach(display => {
        //     console.log(`显示器:`);
        //     console.log(JSON.stringify(display));
        //     // console.log(`分辨率: ${display.resolutionX}x${display.resolutionY}`);
        //     // console.log(`当前分辨率: ${display.currentResX}x${display.currentResY}`);
        // });
        console.log("si 屏幕信息")
        console.log(graphics.displays)
        // console.log(JSON.stringify(graphics))

        // screenshot-desktop 获取屏幕信息
        screenshot.listDisplays().then((displays) => {
            console.log(displays)
        })

        return graphics.displays;
    } catch (e) {
        console.error(e);
        return null
    }

}

/**
 * 获取鼠标所在屏幕信息
 * @returns {Promise<Systeminformation.GraphicsDisplayData|null>}
 *
 * @param mouseX
 * @param mouseY
 * @param displays
 * @returns {*|null}
 */
function findCurrentDisplay(mouseX, mouseY, displays) {
    for (const display of displays) {
        const dx = display.positionX;
        const dy = display.positionY;
        const dw = display.resolutionX;
        const dh = display.resolutionY;

        if (mouseX >= dx && mouseX < dx + dw &&
            mouseY >= dy && mouseY < dy + dh) {
            return display;
        }
    }
    return null;
}



export { getScreenInfo ,shutdown}
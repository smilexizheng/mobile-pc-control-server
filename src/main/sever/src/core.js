import {keyboard, mouse, Point} from "@nut-tree-fork/nut-js";

import {Monitor} from 'node-screenshots'
import sharp from "sharp";
import zlib from "zlib";

mouse.config.autoDelayMs = 0
keyboard.config.autoDelayMs = 0


const getMousePos = async () => {
    return await mouse.getPosition();
};

const mouseClick = async (button, doubleClick) => {
    if (!doubleClick) {
        await mouse.click(button);
    } else {
        await mouse.doubleClick(button);
    }
}


const mouseToggle = async (isPress, button) => {
    if (isPress) {
        await mouse.pressButton(button);
    } else {
        await mouse.releaseButton(button);
    }
}


const moveMouse = async (x, y) => {
    await mouse.move([new Point(x, y)]);
}



const grabRegion = async (mouseX, mouseY, captureWidth, captureHeight) => {

    // 确定鼠标所在的显示器
    let monitor = Monitor.fromPoint(mouseX, mouseY);
    if (!monitor) {
        throw new Error("鼠标不在任何已知显示器区域内");
    }
    // 解析显示器参数（根据实际数据结构调整属性名）
    const displayX = monitor.x;
    const displayY = monitor.y;
    const displayWidth = monitor.width;
    const displayHeight = monitor.height;


    // 检查显示器是否足够大
    if (displayWidth < captureWidth || displayHeight < captureHeight) {
        throw new Error("显示器分辨率不足以截取指定大小的区域");
    }

    // 计算初始截图区域的左上角坐标
    let startX = mouseX - captureWidth / 2;
    let startY = mouseY - captureHeight / 2;
    const beforeX = startX;
    const beforeY = startY;
    // 计算截图区域的边界坐标
    // console.log(startX, startY, currentDisplay)
    // 调整坐标确保在显示器范围内
    startX = Math.max(startX, displayX);
    startX = Math.min(startX, displayX + displayWidth - captureWidth);

    startY = Math.max(startY, displayY);
    startY = Math.min(startY, displayY + displayHeight - captureHeight);

    const img =   monitor.captureImageSync();

    let left=0,right=0,top=0,bottom=0;
    if(startX !== beforeX || startY !== beforeY){
        if(beforeX>startX){
            left=(startX+captureWidth/2)-mouseX;
        }else{
            left=(startX+captureWidth/2)-mouseX;
        }

        if(beforeY>startY){
            top=(startY+captureHeight/2)-mouseY;
        }else{
            top=(startY+captureHeight/2)-mouseY;

        }
    }



    // return {left,right,top,bottom
    //     ,buffer: (await img.crop(startX < 0 ? monitor.width - (Math.abs(startX)) : startX, startY, captureWidth, captureHeight)).toJpegSync()};

  startX = Math.round(startX < 0 ? monitor.width - (Math.abs(startX)) : startX)
  startY =Math.round(startY)
    return {left,right,top,bottom,screenWidth:img.width,screenHeight:img.height,x:startX,y:startY
        ,image: await sharp(img.toRawSync(),{raw: {width:img.width,height:img.height,channels:4}}).extract({
            left:startX,top:startY,width:captureWidth,height:captureHeight
      }).toFormat('webp',{quality:30}).toBuffer()};


}




export {getMousePos, moveMouse, mouseClick, mouseToggle, grabRegion};


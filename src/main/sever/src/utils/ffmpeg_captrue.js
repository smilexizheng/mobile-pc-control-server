import ffmpegPath from 'ffmpeg-static';
import {spawn} from 'child_process';


// import {createWriteStream} from "fs";

// const file = createWriteStream("capture.flv");


let process;

let header = null;
const sendHeader = (io,socket) => {
    if (header) {
        socket.emit('flv_data', header);
    }else {
        console.log("服务启动中")
        startScreenLive(io);
    }

}


const startScreenLive = (io) => {
    if(process) return
    process = spawn(
        ffmpegPath,
        // [
        //     "-probesize", "10M",
        //     "-f", "gdigrab",
        //     "-framerate", "30",
        //     "-i", "desktop",
        //     // "-show_mouse", "0", // 禁用鼠标指针显示
        //     "-f", "flv",
        //     "-"
        // ]
        [
            '-f', 'gdigrab',
            '-i', 'desktop',
            '-vcodec', 'libx264',
            '-preset', 'ultrafast',
            '-g', '30',
            '-tune', 'zerolatency',
            '-f', 'flv',       // 指定容器为 FLV
            'pipe:1'           // 输出到 stdout
        ],
        {stdio: "pipe"}
    );

    const stream = process.stdout;

// stream.pipe(file);

// 处理捕获的流数据
    stream.on('data', (data) => {
        if (!io.sockets.adapter.rooms.has("screenlive")) {
            stopScreenLive();
        }

        if (!header) {
            header = data;
        }
        // 处理视频流数据
        // console.log('Received video data:', data.length)
        io.to('screenlive').emit('flv_data', data);
    });

    stream.on('end', () => {
        console.log('Stream ended');
    });

    process.on('error', (error) => {
        console.error('Error:', error);
    });

    process.on('close', (code) => {
        console.log('FFmpeg process exited with code:', code);
    });
}

const stopScreenLive = () => {
    if (process) {
        header = null;
        process.kill();
        process = null;
    }
}

export {stopScreenLive, startScreenLive, sendHeader}


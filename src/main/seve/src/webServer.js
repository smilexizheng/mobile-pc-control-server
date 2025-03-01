import express from 'express';
import path from 'path';

const app = express();
const port = 3001;


const startWebServer = () => {
  console.log('Starting web server...')

// 托管静态文件（public 目录）
    app.use(express.static(path.join(process.cwd(), 'public')));

// 根路由指向 index.html
    app.get('/*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });
    app.listen(port, () => {
        console.log(`WebServer running at http://localhost:${port}`);
    });
}

export default startWebServer;

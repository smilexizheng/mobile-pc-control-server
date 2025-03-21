import express from 'express';
import upath, {join} from "upath";
import {app} from "electron";

// const webExpress = express();
// const port = 3001;


const startWebServer = (webExpress) => {

   // const webPath = app.isPackaged
   //  ? upath.join(process.resourcesPath, 'app.asar.unpacked', 'resources','web') : upath.join(process.cwd(), 'resources','web')

const webPath = app.isPackaged
    ? upath.join(join(__dirname, '../web')) : upath.join(process.cwd(), 'out','web')


// 托管静态文件（public 目录）
  webExpress.use(express.static(webPath));

// 根路由指向 index.html
  webExpress.get('/*', (req, res) => {
        res.sendFile(upath.join(webPath,  'index.html'));
    });
  // webExpress.listen(port, () => {
  //       console.log(`WebServer running at http://localhost:${port}`);
  //   });
}

export default startWebServer;

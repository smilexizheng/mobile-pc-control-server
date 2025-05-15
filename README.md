# Mobile Remote PC Control

基于Node.js Electron 的助手应用，核心远程控制电脑\其他辅助性功能，移动端H5界面简洁，适用于常见的手机电脑互通的场景。

![PC 界面预览](docs/img/1.png)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/smilexizheng/mobile-pc-control-server)
## 主要功能

### PC 端功能

- **远程控制**：通过移动设备控制电脑的鼠标和键盘
- **消息互传**：聊天和发送文件
- **OCR 图文识别**：支持图片文字识别和涂鸦标注 [进行中]
- **语音识别与合成**：基于 sherpa-onnx 的 ASR 语音识别和 TTS 文字转语音 [进行中]
- **自定义指令分享**：在线分享自定义指令和定时任务 [计划中]

### 移动端功能

- **远程控制**：文本输入、快捷键操作、鼠标移动/点击/拖拽
- **自定义指令**：自定义一组，鼠标-键盘操作逻辑
- **定时任务**：使用 cron 表达式设置定时触发的动作指令，实现自动化
- **文件传输**：从移动设备上传文件到电脑
- **窗口截图**：查看电脑运行应用的窗口截图

## 界面预览

### OCR 图文识别

![OCR 界面](docs/img/ocr.png)

### 消息互传

![img9.png](docs/img/chat.png)

### 移动端控制界面

<table>
  <tr>
    <td><img src="docs/img/2.png" alt="移动端主界面" width="250"/></td>
    <td><img src="docs/img/3.png" alt="远程控制" width="250"/></td>
    <td><img src="docs/img/5.png" alt="文件共享" width="250"/>
      <img src="docs/img/6.png" alt="创建自动化操作" width="250"/></td>
  </tr>
  <tr>
    <td><img src="docs/img/8.png" alt="本地指令" width="250"/></td>
    <td><img src="docs/img/4.png" alt="自动化操作详情" width="250"/></td>
    <td><img src="docs/img/7.png" alt="窗口截屏" width="250"/></td>
  </tr>
</table>

## 平台支持

- ✅ Windows
- 🔄 macOS（开发中）
- 🔄 Linux（开发中）

## 开发进度

- [√]重构为TypeScript
- [√]PC端窗口化 自控/远控
- [√]socket.io 连接鉴权配置
- [-]服务端自定义客户端的 快捷指令、以及权限管理
- [-]增加客户端连接状态监控

## 运行项目

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### 移动端仓库

[ mobile-pc-control-web 仓库](https://github.com/smilexizheng/mobile-pc-control-web).

- 将移动端web项目`build`后的静态资源放到此项目的`out/web`文件中,然后`build:win`, 即可替换移动端网页
- 修改首页菜单方式

```javascript
// 此处定义了客户端 发送和接收的event事件类型 https://github.com/smilexizheng/mobile-pc-control-server/tree/master/src/main/sever/src/constant
// 数据结构如下
[
  {
    categoryName: "快捷指令", modules: [
      {name: "腾讯视频", color: "#2196F3", events: [{event: CE.OPEN_URL, eventData: {url: "https://v.qq.com/"}}]},
      // 支持自定义一组指令，delay 设置指令执行间隔时间，单位毫秒
      {
        name: "视频全屏", color: "#2196F3", events: [
          {event: CE.SYS_POINTER_MOVE, eventData: {x: 1230, y: 850}},
          {event: CE.SYS_POINTER_MOVE, eventData: {x: 1438, y: 966}, delay: 10},
          {event: CE.SYS_MOUSE_CLICK, eventData: {button: 0, double: false}, delay: 20}
        ]
      },
      {name: "ESC", color: "#FF5722", events: [{event: CE.KEYPRESS, eventData: {key: [Key.Escape]}}]},
      {
        name: "音乐上一首",
        color: "#4CAF50",
        events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.LeftAlt, Key.Left]}}]
      },
      {name: "B站", color: "#4CAF50", events: [{event: CE.OPEN_URL, eventData: {url: "https://www.bilibili.com/"}}]},
    ]
  },
  {
    categoryName: "系统", modules: [
      {name: "回桌面", color: "#4CAF50", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftWin, Key.D]}}]},
      {name: "复制", color: "#2196F3", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.C]}}]},
      {name: "粘贴", color: "#2196F3", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.V]}}]},
      {name: "撤回", color: "#FF5722", events: [{event: CE.KEYPRESS, eventData: {key: [Key.LeftControl, Key.Z]}}]},
      {name: "关机", color: "#FF5722", events: [{event: CE.SYS_SHUTDOWN}]}],
    // 显示系统音量控制
    showSysVolume: true
  }
]
```

## Github Star历史

[![Stargazers over time](https://starchart.cc/smilexizheng/mobile-pc-control-server.svg?variant=adaptive&background=%23ffffff&axis=%23101010&line=%23e86161)](https://starchart.cc/smilexizheng/mobile-pc-control-server)


**Mobile-PC-Control-Server** (also known as ControlServer) is an Electron-based desktop application that transforms your PC into a powerful remote control server. It allows users to control their computer seamlessly from mobile phones or web browsers over a local network — no internet required.

By running on your PC, the app starts an embedded Express + Socket.IO server. Users simply scan a QR code displayed on the PC to connect via a mobile-optimized H5 web interface. Once connected,

**default token is 'ssss'**

Quick insights: View AI analysis [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/smilexizheng/mobile-pc-control-server)
[![GitHub stars](https://img.shields.io/github/stars/smilexizheng/mobile-pc-control-server.svg)](https://github.com/smilexizheng/mobile-pc-control-server/stargazers)
[![License](https://img.shields.io/github/license/smilexizheng/mobile-pc-control-server.svg)](LICENSE)

<p align="center">English | <a href="https://github.com/smilexizheng/mobile-pc-control-server">中文</a><br></p>

### you can
- Perform real-time remote desktop control (keyboard input, mouse movement, click, drag, scroll)
- Stream the PC screen at up to 55 FPS using FFmpeg
- Transfer files bidirectionally (chunked upload/download)
- Send real-time chat messages and view online users
- Execute custom automation scripts, macros, and scheduled tasks (cron support)
- Use built-in OCR for screen text recognition
- Annotate/draw on the remote screen
- Control system functions (volume, shutdown, window management, etc.)
- Try experimental voice features (ASR/TTS – beta)

**Key Technologies**: Electron · Vue 3 · Socket.IO · Express · FFmpeg · nut.js · sherpa-onnx · Pinia · electron-vite

### Highlights:

Token-based authentication for security
High-performance, low-latency screen streaming
Touch-friendly mobile web UI
Local storage & persistent settings
Cross-platform build support (Windows primary, macOS/Linux scripts available)

Ideal for scenarios such as: couch PC control, presentation assistance, home automation trigger, quick file sharing between phone and PC, or lightweight remote administration without heavy software like TeamViewer.



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

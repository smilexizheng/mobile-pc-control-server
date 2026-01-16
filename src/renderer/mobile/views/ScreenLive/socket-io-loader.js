import { BaseLoader, LoaderStatus, LoaderErrors } from 'flv.js'
import { CLIENT_EMIT_EVENTS as CE } from '@mobile/constant/client-emit.js'

/**
 * rewrite socket-io-loader  be based on FLV over WebSocket live stream
 * https://github.com/bilibili/flv.js/blob/master/src/io/websocket-loader.js
 */

class SocketIoLoader extends BaseLoader {
  static isSupported() {
    try {
      return typeof self.WebSocket !== 'undefined'
    } catch (e) {
      return false
    }
  }

  constructor() {
    super('socket-io-loader')
    this.TAG = 'SocketIOLoader'

    this._needStash = true

    this._socket = null
    this._dataConfig = null
    this._requestAbort = false

    this._receivedLength = 0
    this._onDataArrival = null
    this._flvHeaderPatched = false
  }

  destroy() {
    if (this._socket) {
      this.abort()
    }
    super.destroy()
  }

  open(dataSource) {
    this._dataConfig = dataSource
    this._flvHeaderPatched = false
    try {
      // let ws = this._ws = new self.WebSocket(dataSource.url);
      // ws.binaryType = 'arraybuffer';
      // ws.onopen = this._onWebSocketOpen.bind(this);
      // ws.onclose = this._onWebSocketClose.bind(this);
      // ws.onmessage = this._onWebSocketMessage.bind(this);
      // ws.onerror = this._onWebSocketError.bind(this);
      this._socket = dataSource.url.socket
      this._socket.on('flv_data', (chunk) => {
        // console.log("数据流")
        this._onWebSocketMessage({ data: chunk })
      })

      this._socket.emit(CE.JOIN_ROOM, { roomName: dataSource.url.roomName })
      this._socket.emit(CE.GET_SCREEN_STREAM_HEADER)

      this._status = LoaderStatus.kConnecting
    } catch (e) {
      this._status = LoaderStatus.kError

      let info = { code: e.code, msg: e.message }

      if (this._onError) {
        this._onError(LoaderErrors.EXCEPTION, info)
      } else {
        console.error(info.msg)
        // throw new RuntimeException(info.msg);
      }
    }
  }

  /**
   * 中断或关闭连接
   */
  abort() {
    this._socket.emit(CE.LEAVE_ROOM, { roomName: this._dataConfig.url.roomName })
    this._status = LoaderStatus.kComplete
  }

  _onWebSocketOpen(e) {
    this._status = LoaderStatus.kBuffering
  }

  _onWebSocketClose(e) {
    if (this._requestAbort === true) {
      this._requestAbort = false
      return
    }

    this._status = LoaderStatus.kComplete

    if (this._onComplete) {
      this._onComplete(0, this._receivedLength - 1)
    }
  }

  _onWebSocketMessage(e) {
    if (e.data instanceof ArrayBuffer) {
      this._dispatchArrayBuffer(e.data)
    } else if (e.data instanceof Blob) {
      let reader = new FileReader()
      reader.onload = () => {
        this._dispatchArrayBuffer(reader.result)
      }
      reader.readAsArrayBuffer(e.data)
    } else {
      this._status = LoaderStatus.kError
      let info = { code: -1, msg: 'Unsupported WebSocket message type: ' + e.data.constructor.name }

      if (this._onError) {
        this._onError(LoaderErrors.EXCEPTION, info)
      } else {
        console.error(info.msg)
        // throw new RuntimeException(info.msg);
      }
    }
  }

  _dispatchArrayBuffer(arraybuffer) {
    let chunk = arraybuffer
    let byteStart = this._receivedLength
    this._receivedLength += chunk.byteLength
    if (this._onDataArrival) {
      this._onDataArrival(chunk, byteStart, this._receivedLength)
    }
  }

  _onWebSocketError(e) {
    this._status = LoaderStatus.kError

    let info = {
      code: e.code,
      msg: e.message
    }

    if (this._onError) {
      this._onError(LoaderErrors.EXCEPTION, info)
    } else {
      console.error(info.msg)
      // throw new RuntimeException(info.msg);
    }
  }
}

export default SocketIoLoader

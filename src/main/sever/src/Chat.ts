import { getClientInfo } from './utils/socketUtil'

// 记录在线的用户
const onlineSocket = {}
let hostSocket: ClientInfo | null = null
const initChat = (io, socket): void => {
  // 记录连接信息
  const socketInfo = getClientInfo(socket)
  if (socket.handshake.auth.isServer) {
    hostSocket = socketInfo
    console.log(hostSocket)
    socketInfo.name = '服务主机'
  }
  onlineSocket[socketInfo.id] = socketInfo

  // 收到socket消息
  socket.on('chat-message', async (message: ChatMessage) => {
    console.log('收到消息', message)
    io.to(message.to).emit('chat-message', {
      ...message,
      form: socket.id,
      msgType: message.msgType || 'txt'
    } as ChatMessage)
  })
  // 通知客户端列表s
  const sendClientList = (): void => {
    io.sockets.emit('client-list', onlineSocket)
  }
  // 处理客户端断开连接
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id)
    if (onlineSocket[socket.id]) {
      io.sockets.emit('client-leave', socket.id)
      delete onlineSocket[socket.id]
      sendClientList()
    }
  })
  sendClientList()
}

export { initChat, onlineSocket }

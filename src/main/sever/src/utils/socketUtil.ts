import { UAParser } from 'ua-parser-js'

/**
 * 获取客户端基础信息
 * @param socket
 */
const getClientInfo = (socket): ClientInfo => {
  // 获取客户端IP地址
  const clientIp = socket.handshake.address
  // 获取请求头信息
  const headers = socket.handshake.headers
  // 获取用户代理(User-Agent)
  const userAgent = new UAParser(headers['user-agent']).getResult()
  // 获取连接时间
  const connectTime = new Date(socket.handshake.time)
  return { id: socket.id, connectTime, userAgent, clientIp }
}

export { getClientInfo }

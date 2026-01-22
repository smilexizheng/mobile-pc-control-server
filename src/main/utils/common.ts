import { nativeImage } from 'electron'
import os from 'os'
import NativeImage = Electron.NativeImage
import * as crypto from 'crypto'
import appIcon from '../../../build/icon.png?asset'
// 获取所有IPv4地址
const getLocalIPs = (): string[] => {
  const interfaces = os.networkInterfaces()
  const ips: string[] = []
  const platform = process.platform

  // 定义各平台虚拟接口的正则表达式
  const virtualPatterns = {
    linux:
      /^(docker\d*|br-|virbr\d*|vmnet\d*|veth|lo|tun\d*|tap\d*|ppp\d*|vboxnet\d*|ovs.*|gre.*|gretap.*|ip_vti.*|ip6_vti.*|ip6_gre.*|ip6_gretap.*|ip6_vti64.*)/i,
    darwin:
      /^(utun\d*|vmnet\d*|vboxnet\d*|lo0|bridge\d*|enx.*|veth.*|docker.*|cali.*|tun.*|tap.*|ppp.*|ipsec.*|gre.*|gretap.*|ip_vti.*|ip6_vti.*|ip6_gre.*|ip6_gretap.*|ip6_vti64.*)/i,
    win32:
      /(VirtualBox|Hyper-V|VMware|Teredo|Microsoft|Loopback|VBox|Nat|NatNetwork|InternalNetwork|PrivateNetwork|PublicNetwork|vEthernet|HyperV|DockerNAT|Docker|WSL|VPN|IPSec|L2TP|PPTP|OpenVPN|TAP-Windows|TunTap|VxLAN|GRE|Geneve|NVGRE|IPSec|L2TP|PPTP|OpenVPN|TAP-Windows|TunTap|VxLAN|GRE|Geneve|NVGRE)/i
  }

  // 获取当前平台的匹配规则，默认不匹配任何
  const virtualRegex = virtualPatterns[platform] || /^$/

  for (const interfaceName in interfaces) {
    // 跳过虚拟接口
    if (virtualRegex.test(interfaceName)) {
      continue
    }

    const addresses = interfaces[interfaceName] || []
    for (const address of addresses) {
      // 检查是否为IPv4且非内部地址
      const isIPv4 = String(address.family).toLowerCase() === 'ipv4'
      if (isIPv4 && !address.internal) {
        // console.log(`Adding IP: ${address.address}`);
        ips.push(address?.address)
      } else {
        // console.log(`Skipping address: ${address.address} (not IPv4 or internal)`);
      }
    }
  }

  return [...new Set(ips)]
}

let icon: NativeImage

const getAppIcon = (): NativeImage => {
  if (icon) {
    return icon
  }
  // const modelPath = upath
  //   .join(__dirname, '../../resources/icon.png')
  //   .replace('app.asar', 'app.asar.unpacked')

  // const iconPath = app.isPackaged
  //   ? upath.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'icon.png')
  //   : upath.join(process.cwd(), 'resources', 'icon.png')

  icon = nativeImage.createFromPath(appIcon)
  return icon
}

/**
 * 信息摘要
 * @param algorithm 'md5' | ''
 * @param input
 */
const createHexDigest = (input: string, algorithm?: 'md5' | 'sha1' | 'sha256' | 'sha512') => {
  // 创建哈希对象
  return crypto
    .createHash(algorithm || 'md5')
    .update(input)
    .digest('hex')
}

/**
 * object转为 url param
 * @param query
 */
const objectToParam = (query) => {
  return Object.keys(query || {})
    .sort()
    .map((key) => `${key}=${encodeURIComponent(query[key])}`)
    .join('&')
}

export { getLocalIPs, getAppIcon, createHexDigest, objectToParam }

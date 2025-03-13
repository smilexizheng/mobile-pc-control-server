const os = require('os');

// 获取所有IPv4地址
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      // 兼容Node.js版本差异：family可能是'IPv4'或4
      const family = address.family.replace(/^IPv4$/, '4'); // 确保转换为字符串
      if (family === '4' && !address.internal) {
        ips.push(address.address);
      }
    }
  }
  return ips;
}

export {getLocalIPs}

import koffi from 'koffi'
// 定义所有 Windows 数据类型
const BOOL = 'bool'
const DWORD = 'uint32'
const WORD = 'uint16'
const ULONG_PTR = 'ulong'
const UCHAR = 'uchar'

// 鼠标事件常量
const MOUSEEVENTF_WHEEL = 0x0800 // 垂直滚动
const MOUSEEVENTF_HWHEEL = 0x1000 // 横向滚动（水平滚动）

// 虚拟键码常量

const VK_CONTROL = 0x11

/**
 * WinApi 封装了 Windows API 的常用功能，包括鼠标、键盘 操作。
 *  WinApi.moveMouse(nowPos.x, nowPos.y);
 *  WinApi.scrollHorizontal(delta ? 120 : -120);
 *  WinApi.scrollVertical(delta ? 120 : -120);
 * @type {IKoffiLib}
 */

// 加载 user32.dll
const user32 = koffi.load('user32.dll')
// 加载 kernel32.dll
const kernel32 = koffi.load('kernel32.dll')

// 定义 Windows API 函数
const USER32_API = {
  SetCursorPos: user32.func('SetCursorPos', BOOL, ['int', 'int']),
  // SetCursorPos: user32.func('SetCursorPos','bool', ['int', 'int']),
  GetCursorPos: user32.func('GetCursorPos', BOOL, [
    koffi.pointer(koffi.struct('POINT', { x: 'int32', y: 'int32' }))
  ]),
  mouse_event: user32.func('mouse_event', 'void', [DWORD, DWORD, DWORD, DWORD, ULONG_PTR]),
  keybd_event: user32.func('keybd_event', 'void', [UCHAR, UCHAR, DWORD, ULONG_PTR]),
  GetAsyncKeyState: user32.func('GetAsyncKeyState', WORD, ['int']),
  GetLastError: kernel32.func('GetLastError', DWORD, [])
}

export class WinApi {
  // 移动鼠标到绝对坐标
  static moveMouse(x, y): void {
    if (!USER32_API.SetCursorPos(x, y)) {
      // throw new Error(`Move mouse failed (Error ${USER32_API.GetLastError()})`);
      console.log(`Move mouse failed (Error ${USER32_API.GetLastError()})`)
    }
  }

  // 滚动鼠标滚轮
  static scrollVertical(delta): void {
    const direction = delta > 0 ? 120 : -120
    USER32_API.mouse_event(MOUSEEVENTF_WHEEL, 0, 0, direction, 0)
  }

  /**
   * 横向滚动（水平滚动）
   * @param delta 滚动量：
   *   - 正数：向右滚动
   *   - 负数：向左滚动
   */
  static scrollHorizontal(delta): void {
    // 每个滚动单位通常对应 120 个 WHEEL_DELTA
    const direction = delta > 0 ? 120 : -120
    USER32_API.mouse_event(MOUSEEVENTF_HWHEEL, 0, 0, direction, 0)
  }

  // 按下键盘按键
  static keyDown(vkCode): void {
    USER32_API.keybd_event(vkCode, 0, 0, 0)
  }

  // 释放键盘按键
  static keyUp(vkCode): void {
    USER32_API.keybd_event(vkCode, 0, 0x0002, 0)
  }

  // 点击键盘按键
  static keyPress(vkCode): void {
    this.keyDown(vkCode)
    this.keyUp(vkCode)
  }

  // 检查按键是否被按下
  static isKeyPressed(vkCode): boolean {
    return (USER32_API.GetAsyncKeyState(vkCode) & 0x8000) !== 0
  }

  // 组合键示例：Ctrl + C
  static sendCtrlC(): void {
    this.keyDown(VK_CONTROL)
    this.keyPress(0x43) // 'C' 键
    this.keyUp(VK_CONTROL)
  }
}

// 使用示例
// try {
//     // 移动鼠标到 (500, 300)
//     WinApi.moveMouse(500, 300);
//
//     // 点击左键
//     WinApi.clickMouse('left');
//
//     // 滚动鼠标
//     WinApi.scrollVertical(120); // 向上滚动
//     WinApi.scrollVertical(-120); // 向下滚动
//
//     // 输入文字
//     WinApi.keyPress(VK_RETURN); // 按下 Enter
//     WinApi.sendCtrlC(); // 发送 Ctrl+C
//
//     // 检查 Shift 是否被按住
//     if (WinApi.isKeyPressed(VK_SHIFT)) {
//         console.log('Shift 键被按住');
//     }
// } catch (err) {
//     console.error('操作失败:', err.message);
// }

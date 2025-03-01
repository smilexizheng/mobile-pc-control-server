export const CLIENT_EMIT_EVENTS = {
    // 加入房间
    JOIN_ROOM: 'join-room',
    LEAVE_ROOM: 'leave_room',
    MOBILE_SCREEN_SIZE: 'mobile_screen_size',
    // 获取屏幕数据流的头
    GET_SCREEN_STREAM_HEADER: 'get_screen_stream_header',

    // 输入事件
    TYPING: 'typing',
    KEYPRESS: 'keypress',
    KEY_TOGGLE: 'key-toggle',
    SYS_MOUSE_MOVE: 'sys-mouse-move',
    OPEN_URL: 'open-url',
    OPEN_APP: 'open-app',

    // 系统控制
    SYS_SHUTDOWN: 'sys-shutdown',
    SYS_SET_VOLUME: 'sys-set-volume',
    SYS_GET_VOLUME: 'sys-get-volume',
    SYS_TOGGLE_MUTE: 'sys-toggle-mute',

    // 鼠标控制
    SYS_MOUSE_CLICK: 'sys-mouse-click',
    SYS_MOUSE_TOGGLE: 'sys-mouse-toggle',
    SYS_SCROLL_HORIZONTAL:'sys_scroll_horizontal',
    SYS_SCROLL_VERTICAL:'sys_scroll_vertical',

    // 指针控制
    SYS_POINTER_START: 'sys-pointer-start',
    SYS_POINTER_MOVE: 'sys-pointer-move',
    SYS_POINTER_END: 'sys-pointer-end',
};
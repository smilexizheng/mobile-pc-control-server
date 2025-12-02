@echo off
:: ===============【检查并自动获取管理员权限】================

:: 方法1：用“net session”判断是否有管理员权限，也可以用 cacls, fsutil 等命令
>nul 2>&1 net session
if %errorlevel% NEQ 0 (
    echo 正在请求管理员权限（UAC 提升）...
    goto UACPrompt
) else (
    goto gotAdmin
)

:UACPrompt
    :: 生成并调用临时 VBS 以调用自身并以管理员身份运行
    set "VBSfile=%temp%\getAdmin.vbs"
    if exist "%VBSfile%" del "%VBSfile%"
    echo Set UAC = CreateObject^("Shell.Application"^)              >> "%VBSfile%"
    :: 第五个参数是窗口样式。0 = 隐藏，1 = 正常，2 = 最小化，等
    :: 如果想最小化，可以填 2。但这里用 1 正常以便能看到 UAC 提示(系统会弹权限窗口)
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1                >> "%VBSfile%"
    cscript //nologo "%VBSfile%"
    exit /b

:gotAdmin
    if exist "%temp%\getAdmin.vbs" del "%temp%\getAdmin.vbs"
    pushd "%CD%"
    cd /d "%~dp0"
:: ===============【检查管理员权限结束】======================

REM 切换到项目所在目录
cd /d "E:\project\win-controll"

:: ===============【你的实际逻辑：调用 node 等】================
:: /B：在同一个窗口中后台运行，脚本本身不会再卡在这里，而是立即继续
"C:\Users\Smile\AppData\Local\nvs\node\20.18.0\x64\node.exe" "E:\project\win-controll\main.mjs"

:: 不要 pause，脚本执行完就退出
:: pause
exit /b
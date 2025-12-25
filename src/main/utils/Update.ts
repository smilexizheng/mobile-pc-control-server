import { UpdateInfo } from 'builder-util-runtime'
import { app } from 'electron'
import log from 'electron-log/main'
import { AppUpdater, autoUpdater, NsisUpdater, UpdateCheckResult } from 'electron-updater'
import path from 'path'
import { systemConfig } from './SystemConfig'
import { generateUserAgent } from './systemInfo'

export default class Updater {
  autoUpdater: AppUpdater = autoUpdater
  private updateCheckResult: UpdateCheckResult | null = null

  constructor() {
    autoUpdater.logger = log
    autoUpdater.forceDevUpdateConfig = !app.isPackaged
    autoUpdater.autoDownload = true
    autoUpdater.autoInstallOnAppQuit = systemConfig.getAutoUpdate()
    autoUpdater.requestHeaders = {
      ...autoUpdater.requestHeaders,
      'User-Agent': generateUserAgent(),
      'X-Client-Id': systemConfig.getClientId()
    }

    autoUpdater.on('error', (error) => {
      log.error('update error', error as Error)
      global.mainWindow.webContents.send('updateError', error)
    })

    autoUpdater.on('update-available', (releaseInfo: UpdateInfo) => {
      log.info('update available', releaseInfo)
      const processedReleaseInfo = this.processReleaseInfo(releaseInfo)
      log.info('update available', processedReleaseInfo)
      global.mainWindow.webContents.send('updateAvailable', processedReleaseInfo)
    })

    // 检测到不需要更新时
    autoUpdater.on('update-not-available', () => {
      log.info('update not available')
      global.mainWindow.webContents.send('updateNotAvailable')
    })

    // 更新下载进度
    autoUpdater.on('download-progress', (progress) => {
      console.log('downloadProgress', progress)
      global.mainWindow.webContents.send('downloadProgress', progress)
    })

    // 当需要更新的内容下载完成后
    autoUpdater.on('update-downloaded', (releaseInfo: UpdateInfo) => {
      const processedReleaseInfo = this.processReleaseInfo(releaseInfo)
      global.mainWindow.webContents.send('updateDownloaded', processedReleaseInfo)
      log.info('update downloaded', processedReleaseInfo)
    })

    if (process.platform === 'win32') {
      ;(autoUpdater as NsisUpdater).installDirectory = path.dirname(app.getPath('exe'))
    }

    this.autoUpdater = autoUpdater
  }

  public setAutoUpdate(isActive: boolean): void {
    autoUpdater.autoInstallOnAppQuit = isActive
  }

  public cancelDownload(): void {
    if (this.autoUpdater.autoDownload) {
      this.updateCheckResult?.cancellationToken?.cancel()
    }
  }

  public async checkForUpdates(): Promise<{
    currentVersion: string
    updateInfo: UpdateInfo | null
  }> {
    try {
      this.updateCheckResult = await this.autoUpdater.checkForUpdates()
      log.info(
        `update check result: ${this.updateCheckResult?.isUpdateAvailable}, channel: ${this.autoUpdater.channel}, currentVersion: ${this.autoUpdater.currentVersion}`
      )

      return {
        currentVersion: this.autoUpdater.currentVersion,
        updateInfo: this.updateCheckResult?.isUpdateAvailable
          ? this.updateCheckResult?.updateInfo
          : null
      }
    } catch (error) {
      log.error('Failed to check for update:', error as Error)
      return {
        currentVersion: app.getVersion(),
        updateInfo: null
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public quitAndInstall() {
    app.willQuitApp = true
    setImmediate(() => autoUpdater.quitAndInstall())
  }

  private processReleaseInfo(releaseInfo: UpdateInfo): UpdateInfo {
    const processedInfo = { ...releaseInfo }
    if (releaseInfo.releaseNotes && typeof releaseInfo.releaseNotes === 'object') {
      const lang = 'zh-CN'
      processedInfo.releaseNotes = releaseInfo.releaseNotes[lang]
    }
    return processedInfo
  }
}

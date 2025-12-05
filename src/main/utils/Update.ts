import { UpdateInfo } from 'builder-util-runtime'
import { app } from 'electron'
import log from 'electron-log/main'
import { AppUpdater, autoUpdater, NsisUpdater, UpdateCheckResult } from 'electron-updater'
import path from 'path'
import { systemConfig } from './SystemConfig'
import { generateUserAgent } from './systemInfo'

// Language markers constants for multi-language release notes
const LANG_MARKERS = {
  EN_START: '<!--NOTES:en-->',
  ZH_CN_START: '<!--NOTES:zh-CN-->',
  END: '<!--NOTES:END-->'
} as const
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

  /**
   * Process release info to handle multi-language release notes
   * @param releaseInfo - Original release info from updater
   * @returns Processed release info with localized release notes
   */
  private processReleaseInfo(releaseInfo: UpdateInfo): UpdateInfo {
    const processedInfo = { ...releaseInfo }

    // Handle multi-language release notes in string format
    if (releaseInfo.releaseNotes && typeof releaseInfo.releaseNotes === 'string') {
      // Check if it contains multi-language markers
      if (this.hasMultiLanguageMarkers(releaseInfo.releaseNotes)) {
        processedInfo.releaseNotes = this.parseMultiLangReleaseNotes(releaseInfo.releaseNotes)
      }
    }

    return processedInfo
  }

  /**
   * Check if release notes contain multi-language markers
   */
  private hasMultiLanguageMarkers(releaseNotes: string): boolean {
    return releaseNotes.includes(LANG_MARKERS.EN_START)
  }

  /**
   * Parse multi-language release notes and return the appropriate language version
   * @param releaseNotes - Release notes string with language markers
   * @returns Parsed release notes for the user's language
   *
   * Expected format:
   * <!--LANG:en-->English content<!--LANG:zh-CN-->Chinese content<!--LANG:END-->
   */
  private parseMultiLangReleaseNotes(releaseNotes: string): string {
    try {
      const language = 'zh-CN'
      const isChineseUser = language === 'zh-CN' || language === 'zh-TW'

      // Create regex patterns using constants
      const enPattern = new RegExp(
        `${LANG_MARKERS.EN_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${LANG_MARKERS.ZH_CN_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      )
      const zhPattern = new RegExp(
        `${LANG_MARKERS.ZH_CN_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${LANG_MARKERS.END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
      )

      // Extract language sections
      const enMatch = releaseNotes.match(enPattern)
      const zhMatch = releaseNotes.match(zhPattern)

      // Return appropriate language version with proper fallback
      if (isChineseUser && zhMatch) {
        return zhMatch[1].trim()
      } else if (enMatch) {
        return enMatch[1].trim()
      } else {
        // Clean fallback: remove all language markers
        log.warn('Failed to extract language-specific release notes, using cleaned fallback')
        return releaseNotes
          .replace(
            new RegExp(
              `${LANG_MARKERS.EN_START}|${LANG_MARKERS.ZH_CN_START}|${LANG_MARKERS.END}`,
              'g'
            ),
            ''
          )
          .trim()
      }
    } catch (error) {
      log.error('Failed to parse multi-language release notes', error as Error)
      // Return original notes as safe fallback
      return releaseNotes
    }
  }
}

import { app, BrowserWindow, session, ipcMain, nativeImage, Menu } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/appIconlight.png?asset'
import { loadState } from './core/app-state/loader'
import { setupIpcHandlers } from './setupIpcHandlers'
import { closeAllWatchers } from './core/app-state/watchers/closing'
import logger from './core/logger'
import trayManager from './core/menu'
import { startLocalServer } from './server/apiServer'

let localServer: any

// Initialize the application
app.setName('Datalog')

app.commandLine.appendSwitch('disable-features', 'OverlayScrollbar')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  session.defaultSession.clearCache()
  electronApp.setAppUserModelId('com.electron')
  app.dock.setIcon(nativeImage.createFromPath(icon))

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupIpcHandlers()
  loadState()
  startLocalServer().then((server) => {
    localServer = server
  })
  trayManager.createOrUpdateTray()
})

app.on('window-all-closed', () => {
  // DO NOTHING. ELSE I WILL QUIT
})

process.on('SIGINT', async () => {
  logger.debug('SIGINT received. Shutting down...')
  app.quit()
})

process.on('SIGTERM', async () => {
  logger.debug('SIGTERM received. Shutting down...')
  app.quit()
})

const flushWinstonLogs = async (): Promise<void> => {
  return new Promise((resolve) => {
    logger.on('finish', resolve) // Resolves when all logs are flushed
    logger.end() // Ends the logger and flushes all pending logs
  })
}

app.on('will-quit', async (event) => {
  event.preventDefault()
  try {
    logger.debug('App is quitting. Performing cleanup...')
    BrowserWindow.getAllWindows().forEach((win) => win.destroy())
    trayManager.destroyTray()

    if (localServer) {
      localServer.close(() => {
        logger.debug('Local server closed.')
      })
    }

    await closeAllWatchers()
    ipcMain.removeAllListeners()

    // Flush logs after watchers close
    await flushWinstonLogs()
    console.log('Cleanup complete. Quitting app.')
  } catch (error) {
    console.error('Error during app quit cleanup:', error)
  } finally {
    app.exit()
  }
})

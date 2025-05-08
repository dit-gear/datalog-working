import chokidar, { FSWatcher } from 'chokidar'
import { appState } from '../../state'
import { updateProjectFromFile } from '../../../project/updater'
import { forceUnloadActiveproject } from '../../../project/unload'
import logger from '../../../logger'

let settingsWatcher: FSWatcher | null = null

export const initSettingsWatcher = async () => {
  const projectPath = appState.activeProjectPath
  if (!projectPath) throw Error
  settingsWatcher = chokidar.watch(`${projectPath}/config.yaml`, { ignoreInitial: true })

  settingsWatcher.on('ready', () => {
    logger.debug('settingsWatcher started')
  })

  settingsWatcher.on('change', () => {
    logger.debug('settingsWatcher change detected')
    updateProjectFromFile()
  })

  settingsWatcher.on('unlink', () => {
    logger.debug('settingsWatcher unlink detected')
    forceUnloadActiveproject()
  })
}

export const closeSettingsWatcher = async () => {
  if (settingsWatcher) {
    try {
      logger.debug('Closing settingsWatcher...')
      await settingsWatcher.close()
      logger.debug('settingsWatcher closed')
    } catch (error) {
      logger.error('Failed to close settingsWatcher:', error)
    } finally {
      settingsWatcher = null
    }
  } else {
    logger.debug('settingsWatcher is already closed or was never initialized.')
  }
}

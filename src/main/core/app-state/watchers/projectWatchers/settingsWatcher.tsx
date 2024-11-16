import chokidar, { FSWatcher } from 'chokidar'
import { getActiveProjectPath } from '../../state'
import { updateProjectFromFile } from '../../../project/updater'
import { unloadActiveProject } from '../../../project/unload'
import logger from '../../../logger'

let settingsWatcher: FSWatcher | null = null

export const initSettingsWatcher = async () => {
  const projectPath = getActiveProjectPath()
  if (!projectPath) throw Error
  settingsWatcher = chokidar.watch(`${projectPath}/config.yaml`, { ignoreInitial: true })

  settingsWatcher.on('ready', () => {
    logger.debug('settingsWatcher started')
  })

  settingsWatcher.on('change', () => {
    updateProjectFromFile()
  })

  settingsWatcher.on('unlink', () => {
    unloadActiveProject()
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

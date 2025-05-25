import { updateState } from '../app-state/updater'
import { appState, datalogs } from '../app-state/state'
import { Notification, nativeImage } from 'electron'
import logger from '../logger'
import { closeProjectWatchers } from '../app-state/watchers/projectWatchers/manager'
import infoicon from '../../../../resources/info_icon.png?asset'

export const forceUnloadActiveproject = async () => {
  await Promise.allSettled([closeProjectWatchers(), updateState({ setActiveProject: null })])
  appState.project = null
  appState.activeProjectPath = null
  datalogs().clear()

  if (Notification.isSupported()) {
    new Notification({
      title: 'Project Unmounted',
      body: 'The active project folder is no longer accessible. It may have been moved or deleted. Please check its location or reselect a project',
      timeoutType: 'never',
      icon: nativeImage.createFromPath(infoicon)
    }).show()
  } else {
    logger.debug('Notifications is disabled')
  }
  logger.debug('Project unmounted succesfully')
}

export const unloadProject = async (): Promise<void> => {
  logger.debug('unloading project...')
  try {
    await closeProjectWatchers()
    datalogs().clear()
    appState.project = null
    appState.activeProjectPath = null
    logger.debug('successfully unloaded project')
  } catch (error) {
    logger.error('failed unloading project')
    throw new Error()
  }
}

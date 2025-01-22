import { updateState } from '../app-state/updater'
import { appState } from '../app-state/state'
import { Notification } from 'electron'
import logger from '../logger'
import { closeProjectWatchers } from '../app-state/watchers/projectWatchers/manager'

export const forceUnloadActiveproject = async () => {
  await Promise.allSettled([closeProjectWatchers(), updateState({})])
  appState.activeProject = null

  if (Notification.isSupported()) {
    new Notification({
      title: 'Project Unmounted',
      body: 'The active project folder is no longer accessible. It may have been moved or deleted. Please check its location or reselect a project',
      timeoutType: 'never'
    }).show()
  } else {
    logger.debug('Notifications is disabled')
  }
  logger.debug('Project unmounted succesfully')
}

export const unloadProject = async () => {
  await closeProjectWatchers()
  appState.activeProject = null
}

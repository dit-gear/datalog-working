import { updateState } from '../app-state/updater'
import { setActiveProject } from '../app-state/state'
import { Notification } from 'electron'
import logger from '../logger'

export const deleteActiveProject = async () => {
  await updateState({})
  setActiveProject(null)
  // Add closeProjectWatchers-function, update any browser state.
  if (Notification.isSupported()) {
    new Notification({
      title: 'Project Unmounted',
      body: 'The active project folder is no longer accessible. It may have been moved or deleted. Please check its location or reselect a project',
      timeoutType: 'never'
    }).show()
  } else {
    logger.debug('Notifications is disabled')
  }
  logger.debug('Project unmounted succseefully')
}
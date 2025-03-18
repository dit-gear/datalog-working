import { initSettingsWatcher, closeSettingsWatcher } from './settingsWatcher'
import { initDatalogWatcher, closeDatalogsWatcher } from './datalogWatcher'
import { initTemplateWatcher, closeTemplatesWatcher } from './templatesWatcher'
import logger from '../../../logger'

export const initProjectWatchers = async () => {
  logger.debug('initProjectWatchers started')
  await Promise.all([initSettingsWatcher(), initTemplateWatcher(), initDatalogWatcher()])
  logger.debug('ProjectWatchers initialized')
}

export const closeProjectWatchers = async () => {
  await Promise.allSettled([
    closeSettingsWatcher(),
    closeTemplatesWatcher(),
    closeDatalogsWatcher()
  ])
}

import { initSettingsWatcher, closeSettingsWatcher } from './settingsWatcher'
import { initDatalogWatcher, closeDatalogsWatcher } from './datalogWatcher'
import { initTemplateWatcher, closeTemplatesWatcher } from './templatesWatcher'

export const initProjectWatchers = async () => {
  await Promise.all([initSettingsWatcher(), initTemplateWatcher(), initDatalogWatcher()])
}

export const closeProjectWatchers = async () => {
  await Promise.allSettled([
    closeSettingsWatcher(),
    closeTemplatesWatcher(),
    closeDatalogsWatcher()
  ])
}

import { closeProjectWatchers } from './projectWatchers/manager'
import { closeRootWatcher } from './rootWatcher'

export const closeAllWatchers = async () => {
  await Promise.allSettled([closeRootWatcher(), closeProjectWatchers()])
}

import { setuProjectIpcHandlers } from './project/ipcHandlers'
import { setupEntriesIpcHandlers } from './entries/ipcHandlers'

export function setupIpcHandlers(): void {
  setuProjectIpcHandlers()
  setupEntriesIpcHandlers()
}

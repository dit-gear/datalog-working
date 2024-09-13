import { setuProjectIpcHandlers } from './project/ipcHandlers'
import { setupDatalogBuilderIpcHandlers } from './datalog/builder/ipcHandlers'
import { setupDatalogLoadingIpcHandlers } from './datalog/loader/ipcHandlers'

export function setupIpcHandlers(): void {
  setuProjectIpcHandlers()
  setupDatalogBuilderIpcHandlers()
  setupDatalogLoadingIpcHandlers()
}

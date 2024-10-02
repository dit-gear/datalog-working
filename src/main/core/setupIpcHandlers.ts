import { setuProjectIpcHandlers } from './project/ipcHandlers'
import { setupDatalogIpcHandlers } from './datalog/ipcHandlers'

export function setupIpcHandlers(): void {
  setuProjectIpcHandlers()
  setupDatalogIpcHandlers()
}

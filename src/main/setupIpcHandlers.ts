import { setuProjectIpcHandlers } from './core/project/ipcHandlers'
import { setupDatalogIpcHandlers } from './core/datalog/ipcHandlers'
import { setupEditorIpcHandlers } from './editor/ipcHandlers'
import { setupSendIpcHandlers } from './send/ipcHandlers'

export function setupIpcHandlers(): void {
  setuProjectIpcHandlers()
  setupDatalogIpcHandlers()
  setupEditorIpcHandlers()
  setupSendIpcHandlers()
}

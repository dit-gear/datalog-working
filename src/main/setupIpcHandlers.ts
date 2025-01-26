import { setuProjectIpcHandlers } from './core/project/ipcHandlers'
import { setupDatalogIpcHandlers } from './core/datalog/ipcHandlers'
import { setupExportIpcHandlers } from './core/export/ipcHandlers'
import { setupEditorIpcHandlers } from './editor/ipcHandlers'
import { setupSendIpcHandlers } from './send/ipcHandlers'
import { setupSharedIpcHandlers } from './sharedIpcHandlers'

export function setupIpcHandlers(): void {
  setuProjectIpcHandlers()
  setupDatalogIpcHandlers()
  setupExportIpcHandlers()
  setupEditorIpcHandlers()
  setupSendIpcHandlers()
  setupSharedIpcHandlers()
}

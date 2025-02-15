import { app, ipcMain } from 'electron'

export function setupAboutIpcHandlers(): void {
  ipcMain.handle('app-version', async (): Promise<string> => app.getVersion())
}

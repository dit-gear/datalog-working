import { ipcMain } from 'electron'
import { exportPdf } from './exportPdf'

export function setupExportIpcHandlers(): void {
  ipcMain.on('pdf-to-export', async (_, pdf, selection) =>
    exportPdf({ pdf, selection, hasDialog: true })
  )
}

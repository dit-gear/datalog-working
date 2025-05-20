import { ipcMain } from 'electron'
import { closeOnboardWindow } from './onboardWindow'
import { getDatalogWindow } from '../datalog/datalogWindow'

export function setupOnboardingIpcHandlers(): void {
  ipcMain.handle('OnboardClose_NewProj', async (): Promise<void> => {
    closeOnboardWindow()
    getDatalogWindow({ navigate: 'new-project' })
  })
}

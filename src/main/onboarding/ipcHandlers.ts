import { ipcMain } from 'electron'
import { closeOnboardWindow } from './onboardWindow'
import { getDatalogWindow } from '../datalog/datalogWindow'

export function setupOnboardingIpcHandlers(): void {
  ipcMain.on('OnboardClose_NewProj', (_event) => {
    console.log('want to close onboarding and open new project')
    closeOnboardWindow()
    getDatalogWindow({ navigate: 'new-project' })
  })
}

import { ipcMain } from 'electron'
import { appState } from '../core/app-state/state'
import {
  getSponsorMessageCache,
  setSponsorMessageCache,
  getCachedViews,
  incrementCachedViewCount,
  clearCachedViews
} from './state'
import { SponsorMessageType } from '@shared/shared-types'

export function setupSponsorHandlers(): void {
  ipcMain.handle('get-ad', async () => ({
    sessionId: appState.sessionId,
    adCache: getSponsorMessageCache(),
    cachedViews: getCachedViews()
  }))
  ipcMain.on('incrementViews', (_, sessionId: string) => incrementCachedViewCount(sessionId))
  ipcMain.on('clearViews', () => clearCachedViews())
  ipcMain.on('update-ad', (_, data: SponsorMessageType) => setSponsorMessageCache(data))
}

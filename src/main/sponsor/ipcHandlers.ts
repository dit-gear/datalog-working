import { ipcMain } from 'electron'
import { appState } from '../core/app-state/state'
import {
  getSponsorMessageCache,
  setSponsorMessageCache,
  getCachedViews,
  incrementCachedViewCount,
  clearCachedViews
} from './state'
import { SponsorMessageResponseType, SponsorMessageType } from '@shared/shared-types'

export function setupSponsorHandlers(): void {
  ipcMain.handle(
    'get-ad',
    async (): Promise<SponsorMessageResponseType> => ({
      sessionId: appState.sessionId,
      adCache: getSponsorMessageCache(),
      cachedViews: getCachedViews()
    })
  )
  ipcMain.on('incrementViews', (_, slotId: string) => incrementCachedViewCount(slotId))
  ipcMain.on('clearViews', () => clearCachedViews())
  ipcMain.on('update-ad', (_, data: SponsorMessageType) => {
    console.log('setting sponsor msg:', data), setSponsorMessageCache(data)
  })
}

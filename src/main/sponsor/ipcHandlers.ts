import { ipcMain } from 'electron'
import { appState } from '../core/app-state/state'
import {
  getSponsorMessageCache,
  setSponsorMessageCache,
  getCachedViews,
  incrementCachedViewCount,
  clearCachedViews,
  incrementCachedClicks,
  getCachedClicks,
  clearCachedClicks
} from './state'
import {
  SponsorMessageResponseType,
  SponsorMessageType,
  SponsorMessageContentType,
  SponsorMessageSchema
} from '@shared/shared-types'

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
  ipcMain.handle(
    'handle-sponsored-message',
    async (_, isOnline: boolean, hasMessage: boolean): Promise<SponsorMessageContentType> => {
      /*if (import.meta.env.DEV) {
        console.log('messages are disabled in DEV')
        return null
      }*/
      const messageCache = getSponsorMessageCache()
      if (!isOnline) {
        if (messageCache) {
          !hasMessage && incrementCachedViewCount(messageCache.slotId)
          return messageCache.content
        }
      }
      try {
        const response = await fetch(import.meta.env.VITE_ADSWORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Ads-Key': import.meta.env.VITE_ADS_KEY
          },
          body: JSON.stringify({
            sessionId: appState.sessionId,
            slotId: messageCache?.slotId ?? null,
            cachedViews: getCachedViews(),
            cachedClicks: getCachedClicks()
          })
        })
        if (!response.ok) {
          const err = await response.json()
          throw new Error(`${response.status}: ${err.error}`)
        }
        clearCachedViews()
        clearCachedClicks()
        const raw = await response.json()
        if (raw === null && messageCache) {
          return messageCache.content
        }
        const messageObj = JSON.parse(raw)
        const result = SponsorMessageSchema.safeParse(messageObj)

        if (!result.success) {
          throw new Error(result.error.toString())
        }
        setSponsorMessageCache(result.data)
        return result.data.content
      } catch (error) {
        console.log('Failed to load sponsor message:', error)
        return null
      }
    }
  )
  ipcMain.on('recordMessageClick', async (_, isOnline: boolean) => {
    if (import.meta.env.DEV) {
      console.log('Clicks are disabled in DEV')
      return
    }
    const messageCache = getSponsorMessageCache()
    if (!isOnline) {
      messageCache && incrementCachedClicks(messageCache.slotId)
      return
    }
    try {
      const response = await fetch(import.meta.env.VITE_CLICKWORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ads-Key': import.meta.env.VITE_ADS_KEY
        },
        body: JSON.stringify({ slotId: messageCache?.slotId })
      })
      if (!response.ok) {
        throw new Error(`${response.status}`)
      }
    } catch (error) {
      console.error(error)
    }
  })
}

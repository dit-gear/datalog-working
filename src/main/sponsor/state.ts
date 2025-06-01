import { SponsorMessageType } from '@shared/shared-types'

const cachedViews = new Map<string, number>()
const cachedClicks = new Map<string, number>()

const getCachedViewCount = (slotId: string): number => cachedViews.get(slotId) ?? 0
const getCachedClicksCount = (slotid: string): number => cachedClicks.get(slotid) ?? 0

export const getCachedViews = () =>
  Array.from(cachedViews.entries()).map(([slotId, views]) => ({ slotId, views }))
export const getCachedClicks = () =>
  Array.from(cachedClicks.entries()).map(([slotId, clicks]) => ({ slotId, clicks }))

export const incrementCachedViewCount = (slotId: string): void => {
  cachedViews.set(slotId, getCachedViewCount(slotId) + 1)
}
export const incrementCachedClicks = (slotId: string): void => {
  cachedClicks.set(slotId, getCachedClicksCount(slotId) + 1)
}

export const clearCachedViews = () => cachedViews.clear()
export const clearCachedClicks = () => cachedClicks.clear()

let sponsorMessageCache: SponsorMessageType | null = null

export const getSponsorMessageCache = (): SponsorMessageType | null => sponsorMessageCache

export const setSponsorMessageCache = (data: SponsorMessageType): void => {
  sponsorMessageCache = data
}

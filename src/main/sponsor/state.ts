import { SponsorMessageType } from '@shared/shared-types'

const cachedViews = new Map<string, number>()
export const getCachedViewCount = (slotId: string): number => cachedViews.get(slotId) ?? 0
export const getCachedViews = () =>
  Array.from(cachedViews.entries()).map(([slotId, views]) => ({ slotId, views }))
export const incrementCachedViewCount = (slotId: string): void => {
  cachedViews.set(slotId, getCachedViewCount(slotId) + 1)
}
export const clearCachedViews = () => cachedViews.clear()

let sponsorMessageCache: SponsorMessageType | null = null

export const getSponsorMessageCache = (): SponsorMessageType | null => sponsorMessageCache

export const setSponsorMessageCache = (data: SponsorMessageType): void => {
  sponsorMessageCache = data
}

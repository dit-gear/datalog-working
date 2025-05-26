import { SponsorMessageType } from '@shared/shared-types'

const cachedViews = new Map<string, number>()
export const getCachedViewCount = (spotId: string): number => cachedViews.get(spotId) ?? 0
export const getCachedViews = () =>
  Array.from(cachedViews.entries()).map(([spotId, views]) => ({ spotId, views }))
export const incrementCachedViewCount = (spotId: string): void => {
  cachedViews.set(spotId, getCachedViewCount(spotId) + 1)
}
export const clearCachedViews = () => cachedViews.clear()

let sponsorMessageCache: SponsorMessageType = null

export const getSponsorMessageCache = (): SponsorMessageType => sponsorMessageCache

export const setSponsorMessageCache = (data: SponsorMessageType): void => {
  sponsorMessageCache = data
}

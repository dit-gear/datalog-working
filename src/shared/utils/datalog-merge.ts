import { DatalogType } from '@shared/datalogTypes'
import { Datalog } from '@shared/datalogClass'
import { getTotalFiles, getTotalSize, getTotalDuration } from '@shared/utils/datalog-methods' // optional if you prefer direct usage

export const getFirstAndLastDatalogs = (
  datalogs: DatalogType[]
): { first: DatalogType; last: DatalogType } => {
  if (!datalogs.length) throw new Error('No datalogs provided')

  const sorted = [...datalogs].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    if (a.day !== b.day) return a.day - b.day
    const unitA = a.unit || ''
    const unitB = b.unit || ''
    return unitA.localeCompare(unitB)
  })

  return { first: sorted[0], last: sorted[sorted.length - 1] }
}

function mergeNumbers(a, b) {
  const digits = b.toString().length
  return a + b / Math.pow(10, digits)
}

export const mergeDatalogs = (datalogs: DatalogType | DatalogType[]): DatalogType => {
  if (!Array.isArray(datalogs)) return datalogs
  const wrapped = datalogs.map((d) => new Datalog(d))

  // Simple helper to check if a raw property is “set” on any Datalog
  const propertyIsSetOnAny = (items: DatalogType[], getter: (d: DatalogType) => unknown): boolean =>
    items.some((d) => getter(d) != null)

  const { first, last } = getFirstAndLastDatalogs(datalogs)

  // Start with a basic merged object
  const merged: DatalogType = {
    id: `${first.id} - ${last.id}`,
    day: mergeNumbers(first.day, last.day),
    date: `${first.date}${first.date !== last.date ? ` - ${last.date}` : ''}`,
    unit: [...new Set(datalogs.map((item) => item.unit))].join(', '),
    ocf: {},
    proxy: {},
    sound: {}
  } as DatalogType

  // --- OCF ---
  if (propertyIsSetOnAny(datalogs, (d) => d.ocf?.files)) {
    merged.ocf && (merged.ocf.files = getTotalFiles(wrapped, 'ocf'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.ocf?.size)) {
    merged.ocf && (merged.ocf.size = getTotalSize(wrapped, 'ocf'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.ocf?.duration)) {
    merged.ocf && (merged.ocf.duration = getTotalDuration(wrapped, 'tc'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.ocf?.reels)) {
    const reelsSet = new Set<string>()
    wrapped.forEach((w) => w.ocf.reels().forEach((r) => reelsSet.add(r)))
    merged.ocf && (merged.ocf.reels = Array.from(reelsSet))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.ocf?.copies)) {
    const copiesSet = new Set<string>()
    wrapped.forEach((w) => {
      w.ocf.copies().forEach((c) => {
        c.volumes.forEach((d) => copiesSet.add(d))
      })
    })
    merged.ocf && (merged.ocf.copies = Array.from(copiesSet))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.ocf?.clips)) {
    merged.ocf && (merged.ocf.clips = datalogs.flatMap((log) => log.ocf?.clips ?? []))
  }

  // --- PROXY ---
  if (propertyIsSetOnAny(datalogs, (d) => d.proxy?.files)) {
    merged.proxy && (merged.proxy.files = getTotalFiles(wrapped, 'proxy'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.proxy?.size)) {
    merged.proxy && (merged.proxy.size = getTotalSize(wrapped, 'proxy'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.proxy?.clips)) {
    merged.proxy && (merged.proxy.clips = datalogs.flatMap((log) => log.proxy?.clips ?? []))
  }

  // --- SOUND ---
  if (propertyIsSetOnAny(datalogs, (d) => d.sound?.files)) {
    merged.sound && (merged.sound.files = getTotalFiles(wrapped, 'sound'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.sound?.size)) {
    merged.sound && (merged.sound.size = getTotalSize(wrapped, 'sound'))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.sound?.copies)) {
    const copiesSet = new Set<string>()
    wrapped.forEach((w) => {
      w.ocf.copies().forEach((c) => {
        c.volumes.forEach((d) => copiesSet.add(d))
      })
    })
    merged.sound && (merged.sound.copies = Array.from(copiesSet))
  }
  if (propertyIsSetOnAny(datalogs, (d) => d.sound?.clips)) {
    merged.sound && (merged.sound.clips = datalogs.flatMap((log) => log.sound?.clips ?? []))
  }

  return merged
}

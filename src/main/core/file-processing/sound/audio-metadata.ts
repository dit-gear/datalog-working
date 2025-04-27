import { secondsToTimecode } from '@shared/utils/format-timecode'
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
//import ffprobePath from '../../../../../resources/ffprobe?asset&asarUnpack'
import z from 'zod'

const ffprobePath =
  process.env.NODE_ENV === 'development'
    ? join(__dirname, '../../../../../../resources/ffprobe/ffprobe.dat')
    : join(process.resourcesPath, 'ffprobe.dat')

type soundMetadataType = {
  tc_start?: string
  tc_end?: string
}

ffmpeg.setFfprobePath(ffprobePath)

const metadataSchema = z
  .object({
    streams: z.array(
      z.object({
        sample_rate: z.coerce.number()
      })
    ),
    format: z.object({
      duration: z.coerce.number(),
      tags: z.object({
        time_reference: z.coerce.number()
      })
    })
  })
  .transform((data) => ({
    sr: data.streams[0].sample_rate,
    tref: data.format.tags.time_reference,
    dur: data.format.duration
  }))

/**
 * Parses metadata from audio file, calculates and returns the timecode.
 *
 * time_reference / sample_rate = start_tc in seconds.
 *
 * @example 2509968001 (time ref) / 48000 (sample rate) = 52291 (start tc in seconds)
 * 52291 => '14:31:31:00'
 * 52291(start tc) + 65(duration) = 52356 => '14:32:36:00'
 * tc_start: '14:31:31:00'
 * tc_end: '14:32:36:00'
 *
 * @param filepath
 */

export const getAudioMetadata = async (filepath: string): Promise<soundMetadataType> => {
  try {
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(filepath, (err, metadata) => {
        if (err) {
          return reject(err) // Reject the promise if there's an error
        }
        resolve(metadata) // Resolve the promise with the metadata
      })
    })
    const result = metadataSchema.safeParse(metadata)
    if (result.success) {
      const { sr, tref, dur } = result.data
      const start = tref / sr
      return {
        tc_start: secondsToTimecode(start),
        tc_end: secondsToTimecode(start + dur)
      }
    } else return {}
  } catch (error) {
    throw error
  }
}
/*

time_reference / sample_rate = start_tc in seconds.

Example: 
2509968001 / 48000 = 52291
52291 = 14:31:31
52291 + 65 = 52356 = 14:32:36

tc_start: 14:31:31
tc_end: '14:32:36'

Remove fps from soundCLip schema. We don't need it!
*/

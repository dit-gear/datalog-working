import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
//import ffprobePath from '../../../../../resources/ffprobe?asset&asarUnpack'

const ffprobePath =
  process.env.NODE_ENV === 'development'
    ? join(__dirname, '../../../../../../resources/ffprobe/ffprobe.dat')
    : join(process.resourcesPath, 'ffprobe.dat')

type proxyMetadataType = {
  codec?: string
  resolution?: string
}

// Construct the path to the ffprobe binary in the assets folder

// Set the ffprobe path for fluent-ffmpeg
ffmpeg.setFfprobePath(ffprobePath)

export const getProxyMetadata = async (filepath: string): Promise<proxyMetadataType> => {
  try {
    const metadata = await new Promise<any>((resolve, reject) => {
      ffmpeg.ffprobe(filepath, (err, metadata) => {
        if (err) {
          return reject(err) // Reject the promise if there's an error
        }
        resolve(metadata) // Resolve the promise with the metadata
      })
    })
    const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video')
    if (videoStream) {
      return {
        codec: videoStream.codec_name,
        resolution: `${videoStream.width}x${videoStream.height}`
      }
    } else return {}
  } catch (error) {
    throw error
  }
}

import ffmpeg from 'fluent-ffmpeg'

type proxyMetadataType = {
  Codec?: string
  Resolution?: string
}

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
        Codec: videoStream.codec_name,
        Resolution: `${videoStream.width}x${videoStream.height}`
      }
    } else return {}
  } catch (error) {
    throw error
  }
}

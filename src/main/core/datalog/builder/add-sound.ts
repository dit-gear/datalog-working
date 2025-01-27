import { dialog } from 'electron'
import fs from 'fs'
import pathnode from 'path'
import type { ResponseWithClips, SoundClipType } from '@shared/datalogTypes'
import findFilesByType from '../../../utils/find-files-by-type'
import processMHL from '../../file-processing/mhl/process-mhl'
import { getAudioMetadata } from '../../file-processing/sound/audio-metadata'

interface addSoundProps {
  paths: string[]
  storedClips: SoundClipType[]
}

const addSound = async ({ paths, storedClips }: addSoundProps): Promise<ResponseWithClips> => {
  try {
    const store = new Map<string, SoundClipType>(storedClips.map((clip) => [clip.clip, clip]))
    let newClips: SoundClipType[] = []

    await Promise.all(
      paths.map(async (path) => {
        const mhlFiles = await findFilesByType(path, 'mhl')

        if (mhlFiles.length === 0) {
          const message = 'No MHL files found in the selected directory.'
          dialog.showErrorBox('Error', message)
          return
        }

        const mhlData = await processMHL(mhlFiles, path, 'sound')
        console.log('mhl', mhlData)
        // Handle Copies merging
        mhlData.forEach((newClip) => {
          let existingClip = store.get(newClip.clip)

          if (existingClip) {
            // If the clip already exists, merge the Copies
            existingClip.copies = [
              ...existingClip.copies,
              ...newClip.copies.filter(
                (copy) =>
                  !existingClip.copies.some((existingCopy) => existingCopy.volume === copy.volume)
              )
            ]
            store.set(existingClip.clip, existingClip)
          } else {
            // If the clip doesn't exist, add it to the list of new clips
            newClips.push(newClip)
          }
        })
      })
    )

    const files: SoundClipType[] = []
    for (const clip of newClips) {
      const wavFiles = await findFilesByType(paths[0], 'wav')
      const filePath = wavFiles.find(
        (file) => pathnode.basename(file, pathnode.extname(file)) === `${clip.clip}`
      )
      if (!filePath) {
        console.error(`No matching .wav file found for clip "${clip.clip}"`)
        continue
      }

      try {
        fs.statSync(filePath)
      } catch (error) {
        console.error(`File not found: ${filePath}, skipping. Error: ${error}`)
        continue
      }

      try {
        const { tc_start, tc_end } = await getAudioMetadata(filePath)
        const { clip: clipclip, ...rest } = clip
        files.push({
          clip: `${clipclip}.wav`,
          ...rest,
          ...(tc_start ? { tc_start } : {}),
          ...(tc_end ? { tc_end } : {})
        })
      } catch (error) {
        console.error(`Error reading metadata for ${filePath}: ${error}`)
        continue
      }
    }

    files.forEach((item) => {
      store.set(item.clip, item)
    })

    return { success: true, clips: { sound: Array.from(store.values()) } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    console.error(`Error parsing sound: ${message}`)
    return { success: false, error: message }
  }
}

export default addSound

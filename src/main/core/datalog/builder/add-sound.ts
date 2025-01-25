import { dialog } from 'electron'
import fs from 'fs'
import pathnode from 'path'
import { ResponseWithClips, SoundClipType } from '@shared/datalogTypes'
import findFilesByType from '../../../utils/find-files-by-type'
import processMHL from '../../file-processing/mhl/process-mhl'
import { soundClipsStore } from './builder-state'
import { getAudioMetadata } from '../../file-processing/sound/audio-metadata'
import logger from '../../logger'

const addSound = async (paths: string[] = []): Promise<ResponseWithClips> => {
  try {
    if (paths.length === 0) {
      const result = await dialog.showOpenDialog({
        title: 'Select Sound folder',
        properties: ['openDirectory']
      })

      if (result.canceled)
        return { success: false, error: 'User cancelled operation', cancelled: true }
      paths = [result.filePaths[0]]
    }

    // We'll accumulate new clips and metadata before updating state
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
          let existingClip = soundClipsStore().get(newClip.clip)

          if (existingClip) {
            // If the clip already exists, merge the Copies
            existingClip.copies = [
              ...existingClip.copies,
              ...newClip.copies.filter(
                (copy) =>
                  !existingClip.copies.some((existingCopy) => existingCopy.volume === copy.volume)
              )
            ]
            soundClipsStore().set(existingClip.clip, existingClip)
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
        logger.error(`No matching .wav file found for clip "${clip.clip}"`)
        continue
      }

      try {
        fs.statSync(filePath)
      } catch (error) {
        logger.error(`File not found: ${filePath}, skipping. Error: ${error}`)
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
        logger.error(`Error reading metadata for ${filePath}: ${error}`)
        continue
      }
    }

    files.forEach((item) => {
      soundClipsStore().set(item.clip, item)
    })

    return { success: true, clips: { sound: Array.from(soundClipsStore().values()) } }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.'
    logger.error(`Error parsing sound: ${message}`)
    return { success: false, error: message }
  }
}

export default addSound

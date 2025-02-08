import { access } from 'fs/promises'
import { constants } from 'fs'
import { CheckPathsResult, CheckResult } from '@shared/shared-types'

interface PathsInput {
  ocf: string[] | null
  sound: string[] | null
  proxy: string | null
}

const checkPath = async (path: string): Promise<CheckResult> => {
  try {
    await access(path, constants.F_OK)
    return { path, available: true }
  } catch {
    return { path, available: false }
  }
}

const checkPaths = async (paths: PathsInput): Promise<CheckPathsResult> => {
  const result: CheckPathsResult = { ocf: null, sound: null, proxy: null }

  if (paths.ocf) {
    result.ocf = await Promise.all(paths.ocf.map(checkPath))
  }
  if (paths.sound) {
    result.sound = await Promise.all(paths.sound.map(checkPath))
  }
  if (paths.proxy) {
    result.proxy = await checkPath(paths.proxy)
  }

  return result
}

export default checkPaths

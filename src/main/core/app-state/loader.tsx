import { app } from 'electron'
import fs from 'fs'
import { stateZod, state, error } from './types'
import { ProjectType } from '../../../shared/projectTypes'
import { decryptData } from '../../utils/encryption'
import path from 'path'
import {
  setRootPath,
  setActiveProjectPath,
  getAppPath,
  getRootPath,
  getActiveProjectPath
} from './state'
import logger from '../logger'
import { ensureDirectoryExists } from '../../utils/crud'
import { updateState } from './updater'
import { loadProject, loadProjectsInRootPath } from '../project/loader'
import { initRootWatcher } from './watchers/rootWatcher'
import { initProjectWatchers } from './watchers/projectWatchers/manager'

async function loadStateFromFile(filepath: string): Promise<state | error> {
  try {
    const fileData = fs.readFileSync(filepath, 'utf8')
    const encryptedObj = JSON.parse(fileData)
    const decrypted = decryptData(encryptedObj)
    const result = stateZod.safeParse(decrypted)
    if (result.success) {
      return result.data
    } else {
      return { error: true, message: 'Decrypted data does not match the expected state structure' }
    }
  } catch (error) {
    return { error: true, message: 'Failed to read or decrypt the file' }
  }
}

async function loadConfig(): Promise<void> {
  try {
    await ensureTemplateFoldersExistSync()
    const configPath = path.join(getAppPath(), 'appconfig.json') as string
    const defaultRootPath = path.join(app.getPath('documents'), 'Datalog')
    if (fs.existsSync(configPath)) {
      const config = await loadStateFromFile(configPath)

      if (!('error' in config)) {
        setRootPath(config.rootPath)
        setActiveProjectPath(config.activeProject)
        logger.debug('Config loaded')
        return
      } else logger.error(config.message)

      logger.info('Creating new Config file')
      ensureDirectoryExists(defaultRootPath)
      await updateState({ newRootPath: defaultRootPath })
      return
    }
  } catch (error) {
    logger.error(`Error loading config: ${error}`)
  }
}

export async function loadState(): Promise<ProjectType> {
  await loadConfig()
  if (getActiveProjectPath()) {
    const loadActiveProject = await loadProject(getActiveProjectPath())
    if (loadActiveProject.success) {
      await loadProjectsInRootPath()
      await initRootWatcher()
      await initProjectWatchers()
      logger.info('Project loaded successfully')
      return {
        rootPath: getRootPath(),
        projectPath: getActiveProjectPath(),
        data: loadActiveProject.data
      }
    }
  }
  await loadProjectsInRootPath()
  await initRootWatcher()
  logger.info('No project to load, returning root path')
  return { rootPath: getRootPath() }
}

async function ensureTemplateFoldersExistSync(): Promise<void> {
  const templates = path.join(getAppPath(), 'templates')
  try {
    ensureDirectoryExists(templates)
    ensureDirectoryExists(path.join(templates, 'email'))
    ensureDirectoryExists(path.join(templates, 'pdf'))
  } catch {
    logger.error('Could not check or create global template folder')
  }
}

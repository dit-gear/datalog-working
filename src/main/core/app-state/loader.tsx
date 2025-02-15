import { app } from 'electron'
import fs from 'fs/promises'
import { stateZod, state } from './types'
import { ProjectType } from '../../../shared/projectTypes'
import { decryptData } from '../../utils/encryption'
import path from 'path'
import { appState } from './state'
import logger from '../logger'
import { ensureDirectoryExists } from '../../utils/crud'
import { updateState } from './updater'
import { loadProject, loadProjectsInRootPath } from '../project/loader'
import { initRootWatcher } from './watchers/rootWatcher'
import { initProjectWatchers } from './watchers/projectWatchers/manager'

async function loadStateFromFile(filepath: string): Promise<state> {
  logger.debug('loadStateFromFile started')
  try {
    const fileData = await fs.readFile(filepath, 'utf8')
    const encryptedObj = JSON.parse(fileData)
    const decrypted = decryptData(encryptedObj)
    const result = stateZod.safeParse(decrypted)

    if (result.success) {
      logger.debug('Successfully loaded state from file')
      return result.data
    } else {
      throw new Error('Decrypted data does not match the expected state structure')
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred'
    logger.error(`Failed to read or decrypt the file: ${message}`)
    throw err
  }
}

async function loadConfig(): Promise<void> {
  try {
    logger.debug('loadConfig started')
    await ensureTemplateFoldersExistSync()
    const configPath = path.join(appState.appPath, 'appconfig.json') as string
    const defaultRootPath = path.join(app.getPath('documents'), 'Datalog')

    try {
      const config = await loadStateFromFile(configPath)

      appState.rootPath = config.rootPath
      appState.activeProjectPath = config.activeProject
    } catch (err) {
      try {
        logger.info('Creating new Config file...')
        // Create a default configuration
        ensureDirectoryExists(defaultRootPath)
        await updateState({ newRootPath: defaultRootPath })
        logger.info('Created new Config file')
      } catch (error) {
        throw error
      }
    }
  } catch (error) {
    logger.error(`Error loading config: ${error}`)
  }
}

export async function loadState(): Promise<ProjectType> {
  logger.debug('loadState started')
  await loadConfig()
  if (appState.activeProjectPath) {
    await loadProjectsInRootPath()
    await initRootWatcher()
    const loadActiveProject = await loadProject(appState.activeProjectPath)
    if (loadActiveProject.success) {
      logger.info('Project loaded successfully')
      return {
        rootPath: appState.rootPath,
        projectPath: appState.activeProjectPath,
        data: loadActiveProject.data
      }
    }
  }

  logger.info('No project to load, returning root path')
  return { rootPath: appState.rootPath }
}

async function ensureTemplateFoldersExistSync(): Promise<void> {
  const templates = path.join(appState.appPath, 'templates')
  console.log(templates)
  try {
    ensureDirectoryExists(templates)
    ensureDirectoryExists(path.join(templates, 'email'))
    ensureDirectoryExists(path.join(templates, 'pdf'))
  } catch {
    logger.error('Could not check or create global template folder')
  }
}

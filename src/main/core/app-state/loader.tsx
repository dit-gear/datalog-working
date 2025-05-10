import { safeStorage } from 'electron'
import { app } from 'electron'
import fs from 'fs/promises'
import { stateZod, state } from './types'
import path from 'path'
import YAML from 'yaml'
import { appState } from './state'
import logger from '../logger'
import { ensureDirectoryExists, fileExists } from '../../utils/crud'
import { updateState } from './updater'
import { loadProject, loadProjects } from '../project/loader'
import { initRootWatcher } from './watchers/rootWatcher'
import { openOnboardWindow } from '../../onboarding/onboardWindow'

async function loadStateFromFile(filepath: string): Promise<state> {
  logger.debug('loadStateFromFile started')
  try {
    const fileData = await fs.readFile(filepath)
    const decrypted = safeStorage.decryptString(fileData)
    const data = JSON.parse(decrypted)
    const result = stateZod.safeParse(data)

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
    await onFirstRun()
    await ensureFoldersExists()
    const configPath = path.join(appState.appPath, 'appconfig.json') as string

    try {
      const config = await loadStateFromFile(configPath)
      appState.activeProjectPath = config.activeProject
    } catch (err) {
      try {
        logger.info('Creating new Config file...')
        // Create a default configuration
        await updateState({ setActiveProject: null })
        logger.info('Created new Config file')
      } catch (error) {
        throw error
      }
    }
  } catch (error) {
    logger.error(`Error loading config: ${error}`)
  }
}

export async function loadState(): Promise<void> {
  logger.debug('loadState started')
  await loadConfig()
  await loadProjects()
  await initRootWatcher()
  if (appState.activeProjectPath) {
    const loadActiveProject = await loadProject(appState.activeProjectPath)
    if (loadActiveProject.success) {
      logger.info('Project loaded successfully')
    }
  }
  logger.info('No project to load')
}

async function ensureConfigExist(config: string) {
  const exists = await fileExists(config)
  if (!exists) {
    const defaultYaml = { logid_template: 'D<dd>_<yymmdd>' }
    const yaml = YAML.stringify(defaultYaml)
    await fs.writeFile(config, yaml, 'utf8')
  }
}

async function ensureFoldersExists(): Promise<void> {
  const templates = path.join(appState.localSharedPath, 'templates')
  try {
    await Promise.all([
      ensureConfigExist(path.join(appState.localSharedPath, 'config.yaml')),
      ensureDirectoryExists(appState.projectsPath)
    ])
    await ensureDirectoryExists(path.join(templates, 'email'))
    await ensureDirectoryExists(path.join(templates, 'pdf', 'assets'))
  } catch {
    logger.error('Could not check or create global template folder')
  }
}

async function onFirstRun() {
  const marker = path.join(appState.appPath, 'onboarded')
  if (
    await fs
      .access(marker)
      .then(() => true)
      .catch(() => false)
  ) {
    logger.info('Already onboarded')
    return
  }
  // Determine template source based on environment
  const src = app.isPackaged
    ? path.join(process.resourcesPath, 'templates')
    : path.join(process.cwd(), 'resources', 'templates')
  const dest = path.join(appState.localSharedPath, 'templates')
  openOnboardWindow()
  try {
    await fs.cp(src, dest, { recursive: true })
    await fs.writeFile(marker, '') // create flag file
    logger.info('First run - Copied starter templates')
  } catch (err) {
    logger.error('Failed to copy starter templates on first run:', err)
  }
}

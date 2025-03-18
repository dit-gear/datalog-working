import path from 'path'
import { join } from 'path'
import fs from 'fs'
import YAML from 'yaml'
import { LoadProjectDataResult } from './types'
import findFilesByType from '../../utils/find-files-by-type'
import { appState } from '../app-state/state'
import {
  ProjectSchemaZod,
  GlobalSchemaZodNullable,
  ProjectRootType,
  TemplateDirectoryFile,
  ProjectInRootMenuItem
} from '../../../shared/projectTypes'
import logger from '../logger'
import { ZodType } from 'zod'
import trayManager from '../menu'
import { updateProjectFolder } from './updater'
import { ensureDirectoryExists } from '../../utils/crud'
import { initProjectWatchers } from '../app-state/watchers/projectWatchers/manager'

const parseSettingsFile = async <T>(filePath: string, schema: ZodType<T>): Promise<T | null> => {
  if (fs.existsSync(filePath)) {
    const yaml = fs.readFileSync(filePath, 'utf8')
    const parsedYaml = YAML.parse(yaml)
    const parse = schema.safeParse(parsedYaml)

    if (parse.success) {
      return parse.data
    } else {
      logger.error(parse.error)
      throw new Error(`Invalid project settings in ${filePath}: ${parse.error}`)
    }
  } else {
    logger.warn('No file to parse')
    throw new Error('Settings file does not exist')
  }

  return null
}

export const getTemplateDirectories = (
  _projectPath?: string
): { dirs: string[]; subdirs: string[]; detailed: TemplateDirectoryFile[] } => {
  const projectPath = _projectPath ?? appState.activeProjectPath
  console.log('getTemplateDirectories-activeProjectPath: ', projectPath)
  const appPath = appState.appPath
  const dirs = [`${projectPath}/templates/`, `${appPath}/templates/`]
  const subdirs = [
    `${projectPath}/templates/email`,
    `${projectPath}/templates/pdf`,
    `${appPath}/templates/email`,
    `${appPath}/templates/pdf`
  ]
  const detailed: TemplateDirectoryFile[] = [
    { path: join(projectPath, 'templates/email'), name: '', type: 'email', scope: 'project' },
    { path: join(projectPath, 'templates/pdf'), name: '', type: 'pdf', scope: 'project' },
    { path: join(appPath, 'templates/email'), name: '', type: 'email', scope: 'global' },
    { path: join(appPath, 'templates/pdf'), name: '', type: 'pdf', scope: 'global' }
  ]
  return { dirs, subdirs, detailed }
}

const loadTemplateDirectory = async (
  dir: TemplateDirectoryFile
): Promise<TemplateDirectoryFile[]> => {
  const { path: dirPath, type, scope } = dir

  await ensureDirectoryExists(dirPath)

  try {
    const files = fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith('.jsx') || file.endsWith('.tsx'))
      .map((file) => ({
        path: join(dirPath, file),
        name: file,
        type,
        scope
      }))
    logger.debug(`Loaded templates from ${dirPath}:`, files)
    return files
  } catch (error) {
    logger.error(`loadTemplateDirectory: Failed to read directory ${dirPath}:`, error)
    return []
  }
}

const loadTemplates = async (projectPath: string): Promise<TemplateDirectoryFile[]> => {
  const { detailed: directories } = getTemplateDirectories(projectPath)

  const templates = await Promise.all(directories.map(loadTemplateDirectory))
  return templates.flat()
}

export const loadProject = async (selectedProjectpath: string): Promise<LoadProjectDataResult> => {
  logger.debug('loadProject started')
  const globalFilePath = path.join(appState.appPath, 'config.yaml')
  if (!fs.existsSync(globalFilePath)) {
    fs.writeFileSync(globalFilePath, '', 'utf8')
  }
  const projectFilePath = path.join(selectedProjectpath, 'config.yaml')
  if (!fs.existsSync(projectFilePath)) {
    logger.error('No settings file found in project')
    return { success: false, message: 'Project not found' }
  }

  try {
    const [globalSettings, projectSettings] = await Promise.all([
      fs.existsSync(globalFilePath)
        ? parseSettingsFile(globalFilePath, GlobalSchemaZodNullable)
        : Promise.resolve(undefined),
      parseSettingsFile(projectFilePath, ProjectSchemaZod)
    ])

    if (!projectSettings) {
      throw new Error('Invalid project settings')
    }

    const folderTemplateExist = projectSettings.logid_template || globalSettings?.logid_template

    if (!folderTemplateExist) {
      throw new Error(
        'logid_template must be present in either global settings or project settings'
      )
    }
    if (projectSettings.project_name !== path.basename(selectedProjectpath)) {
      await updateProjectFolder(projectSettings.project_name)
    }
    const templatesDir = await loadTemplates(selectedProjectpath)
    const folderTemplate = projectSettings.logid_template || globalSettings?.logid_template
    const data: ProjectRootType = {
      ...globalSettings,
      ...projectSettings,
      logid_template: folderTemplate as string,
      settings: {
        project: projectSettings,
        ...(globalSettings && Object.keys(globalSettings).length > 0
          ? { global: globalSettings }
          : {})
      },
      templatesDir
    }
    appState.activeProject = data
    trayManager.createOrUpdateTray()
    console.log('loaded tray')
    await initProjectWatchers()
    console.log('loaded initprojectwatchers')
    logger.debug(`${data.project_name} loaded`)
    return { success: true, data }
  } catch (error) {
    const errorMessage = (error as Error).message
    logger.error(errorMessage)
    return {
      success: false,
      message: `${errorMessage}. Check error logs and correct any issues in config.yaml`
    }
  }
}

export const loadProjectsInRootPath = async (): Promise<void> => {
  logger.debug('loadProjectsInRootPath started')
  const projectPath = appState.activeProjectPath

  const yamlFiles = await findFilesByType(appState.rootPath, 'yaml', {
    includeFileName: 'config.yaml',
    maxDepth: 1
  })
  const projects = yamlFiles.map((filePath): ProjectInRootMenuItem => {
    const folderPath = path.dirname(filePath)
    return {
      project: path.basename(folderPath), // Folder name
      path: folderPath, // Full path to the folder
      active: projectPath ? projectPath === folderPath : false
    }
  })
  logger.debug('Loaded projects in root path')
  appState.projectsInRootPath = projects
  trayManager.createOrUpdateTray()
}

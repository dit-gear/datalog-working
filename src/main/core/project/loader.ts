import path from 'path'
import fs from 'fs'
import { dialog, app } from 'electron'
import YAML from 'yaml'
import { LoadProjectDataResult } from './types'
import findFilesByType from '../../utils/find-files-by-type'
import {
  getRootPath,
  getActiveProjectPath,
  setProjectsInRootPath,
  setActiveProject
} from '../app-state/state'
import {
  ProjectSchemaZod,
  GlobalSchemaZodNullable,
  ProjectRootType
} from '../../../shared/projectTypes'
import logger from '../logger'
import { ZodType } from 'zod'
import { updateTray } from '../menu'
import { updateProjectFolder } from './updater'

const parseSettingsFile = async <T>(filePath: string, schema: ZodType<T>): Promise<T | null> => {
  if (fs.existsSync(filePath)) {
    const yaml = fs.readFileSync(filePath, 'utf8')
    const parsedYaml = YAML.parse(yaml)
    const parse = schema.safeParse(parsedYaml)

    if (parse.success) {
      return parse.data
    } else {
      logger.error(parse.error)
    }
  } else {
    logger.warn('No file to parse')
  }

  return null
}

export const loadProject = async (selectedProjectpath: string): Promise<LoadProjectDataResult> => {
  const globalFilePath = path.join(app.getPath('userData'), 'settings.yaml')
  if (!fs.existsSync(globalFilePath)) {
    fs.writeFileSync(globalFilePath, '', 'utf8')
  }
  const projectFilePath = path.join(selectedProjectpath, 'settings.yaml')
  if (!fs.existsSync(projectFilePath)) {
    logger.error('No settings file found in project')
    return { success: false, message: 'Project not found' }
  }

  try {
    const globalSettings = await parseSettingsFile(globalFilePath, GlobalSchemaZodNullable)
    const projectSettings = await parseSettingsFile(projectFilePath, ProjectSchemaZod)

    if (!projectSettings) {
      throw new Error('Invalid project settings')
    }

    const hasFolderTemplateInGlobal = globalSettings?.folder_template !== undefined
    const hasFolderTemplateInProject = projectSettings.folder_template !== undefined

    if (!hasFolderTemplateInGlobal && !hasFolderTemplateInProject) {
      throw new Error(
        'folder_template must be present in either global settings or project settings'
      )
    }
    if (projectSettings.project_name !== path.basename(selectedProjectpath)) {
      await updateProjectFolder(projectSettings.project_name)
    }
    const folderTemplate = projectSettings.folder_template || globalSettings?.folder_template
    const data: ProjectRootType = {
      ...globalSettings,
      ...projectSettings,
      folder_template: folderTemplate as string,
      settings: {
        project: projectSettings,
        ...(globalSettings && Object.keys(globalSettings).length > 0
          ? { global: globalSettings }
          : {})
      },
      templatesDir: []
    }
    setActiveProject(data)
    updateTray()
    return { success: true, data }
  } catch (error) {
    const errorMessage = (error as Error).message
    dialog.showErrorBox('Error', errorMessage)
    logger.error(errorMessage)
    return {
      success: false,
      message: `${errorMessage}. Check error logs and correct any issues in settings.yaml`
    }
  }
}

export const loadProjectsInRootPath = async (): Promise<void> => {
  const projectPath = getActiveProjectPath()

  const yamlFiles = await findFilesByType(getRootPath(), 'yaml', {
    includeFileName: 'settings.yaml',
    maxDepth: 1
  })
  const projects = yamlFiles.map((filePath) => {
    const folderPath = path.dirname(filePath)
    return {
      project: path.basename(folderPath), // Folder name
      path: folderPath, // Full path to the folder
      active: projectPath ? projectPath === folderPath : false
    }
  })
  setProjectsInRootPath(projects)
  updateTray()
}

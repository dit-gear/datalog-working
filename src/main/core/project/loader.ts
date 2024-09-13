import path from 'path'
import fs from 'fs'
import { dialog, Menu, MenuItemConstructorOptions, MenuItem, app } from 'electron'
import YAML from 'yaml'
import { LoadProjectDataResult } from './types'
import findFilesByType from '../../utils/find-files-by-type'
import { getRootPath, getActiveProjectPath } from '../app-state/state'
import {
  ProjectSchemaZod,
  GlobalSchemaZodNullable,
  ProjectRootType
} from '../../../shared/projectTypes'
import logger from '../logger'
import { ZodType } from 'zod'
import { menuTemplate } from '../menu'

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
      }
    }
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

export async function loadProjectsInRootPath(): Promise<void> {
  const yamlFiles = await findFilesByType(getRootPath(), 'yaml', {
    includeFileName: 'settings.yaml', maxDepth: 1
  })

  const projects =
    yamlFiles && yamlFiles.length > 0
      ? await Promise.all(
          yamlFiles?.map(async (filePath) => {
            const project = fs.readFileSync(filePath, 'utf8')
            const folderPath = path.dirname(filePath)
            const yaml = YAML.parse(project)
            const parsedYaml = ProjectSchemaZod.parse(yaml)
            const projectPath = getActiveProjectPath()
            return {
              project: parsedYaml.project_name,
              path: folderPath,
              active: projectPath ? projectPath === folderPath : false
            }
          })
        )
      : []

  const menu = Menu.buildFromTemplate(
    menuTemplate(projects) as (MenuItemConstructorOptions | MenuItem)[]
  )
  Menu.setApplicationMenu(menu)
}

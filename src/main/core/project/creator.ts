import { dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import YAML from 'yaml'
import { updateState } from '../app-state/updater' // Adjust the import path as necessary
import { loadProject, loadProjectsInRootPath } from './loader'
import { CreateNewProjectResult } from '@shared/projectTypes' // Adjust path as needed
import { getRootPath, getActiveProjectPath } from '../app-state/state'
import logger from '../logger'

async function createProject(projectName: string): Promise<CreateNewProjectResult> {
  const newProjectPath = path.join(getRootPath(), projectName)
  const filepath = path.join(newProjectPath, 'settings.yaml')
  const defaultYaml = {
    project_name: projectName,
    folder_template: 'D<dd>_<yymmdd>'
  }
  const yaml = YAML.stringify(defaultYaml)

  if (fs.existsSync(newProjectPath)) {
    const message = 'Project with the same name already exists in directory'
    logger.warn(message)
    return {
      success: false,
      message: message
    }
  }

  try {
    fs.mkdirSync(newProjectPath)
    fs.writeFileSync(filepath, yaml, 'utf8')

    updateState({ newActiveProject: newProjectPath })

    return {
      success: true
    }
  } catch (error) {
    logger.error('Failed to create new project')
    dialog.showErrorBox('Error', 'Failed to create project')
    return { success: false }
  }
}

export async function createNewProject(projectName: string): Promise<CreateNewProjectResult> {
  const result = await createProject(projectName)

  if (result.success) {
    logger.debug('Project created successfully')
    await loadProjectsInRootPath()
    const project = await loadProject(getActiveProjectPath())
    return {
      success: true,
      project: { rootPath: getRootPath(), projectPath: getActiveProjectPath(), data: project.data }
    }
  }

  return result
}

import { dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import YAML from 'yaml'
import { updateState } from '../app-state/updater' // Adjust the import path as necessary
import { loadProject, loadProjectsInRootPath } from './loader'
import { CreateNewProjectResult } from '@shared/projectTypes' // Adjust path as needed
import { appState } from '../app-state/state'
import logger from '../logger'
import { unloadProject } from './unload'

async function createTemplateFolder(basePath: string): Promise<void> {
  const emailPath = path.join(basePath, 'templates', 'email')
  const pdfPath = path.join(basePath, 'templates', 'pdf')

  try {
    await Promise.all([
      fs.mkdirSync(emailPath, { recursive: true }),
      fs.mkdirSync(pdfPath, { recursive: true })
    ])
    logger.debug(`Folders created successfully at ${emailPath} and ${pdfPath}`)
  } catch (error) {
    logger.error('Failed to create template folder structure')
  }
}

async function createProject(projectName: string): Promise<CreateNewProjectResult> {
  const newProjectPath = path.join(appState.rootPath, projectName)
  const filepath = path.join(newProjectPath, 'config.yaml')
  const defaultYaml = {
    project_name: projectName,
    logid_template: 'D<dd>_<yymmdd>'
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
    createTemplateFolder(newProjectPath)
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
  await unloadProject()
  const result = await createProject(projectName)

  if (result.success) {
    logger.debug('Project created successfully')
    await loadProjectsInRootPath()
    const project = await loadProject(appState.activeProjectPath)
    return {
      success: true,
      project: {
        rootPath: appState.rootPath,
        projectPath: appState.activeProjectPath,
        data: project.data
      }
    }
  }

  return result
}

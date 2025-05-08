import { dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import YAML from 'yaml'
import { updateState } from '../app-state/updater' // Adjust the import path as necessary
import { loadProject, loadProjects } from './loader'
import { CreateNewProjectResult } from '@shared/projectTypes' // Adjust path as needed
import { appState } from '../app-state/state'
import logger from '../logger'
import { unloadProject } from './unload'

async function createFolders(basePath: string): Promise<void> {
  const logPath = path.join(basePath, 'logs')
  const emailPath = path.join(basePath, 'templates', 'email')
  const pdfPath = path.join(basePath, 'templates', 'pdf', 'assets')

  try {
    await Promise.all([
      fs.mkdirSync(logPath, { recursive: true }),
      fs.mkdirSync(emailPath, { recursive: true }),
      fs.mkdirSync(pdfPath, { recursive: true })
    ])
    logger.debug(`Folders created successfully at ${basePath}`)
  } catch (error) {
    logger.error('Failed to create template folder structure')
  }
}

async function createProject(projectName: string): Promise<CreateNewProjectResult> {
  const newProjectPath = path.join(appState.projectsPath, projectName)

  if (fs.existsSync(newProjectPath)) {
    const message = 'Project with the same name already exists in directory'
    logger.warn(message)
    return {
      success: false,
      error: message
    }
  }

  const filepath = path.join(newProjectPath, 'config.yaml')
  const defaultYaml = {
    project_name: projectName
  }
  const yaml = YAML.stringify(defaultYaml)

  await unloadProject()

  try {
    fs.mkdirSync(newProjectPath)
    createFolders(newProjectPath)
    fs.writeFileSync(filepath, yaml, 'utf8')

    updateState({ setActiveProject: newProjectPath })

    return {
      success: true
    }
  } catch (error) {
    const msg = 'Failed to create new project'
    logger.error(msg)
    dialog.showErrorBox('Error', msg)
    return { success: false, error: msg }
  }
}

export async function createNewProject(projectName: string): Promise<CreateNewProjectResult> {
  const result = await createProject(projectName)

  if (result.success) {
    logger.debug('Project created successfully')
    await loadProjects()
    const project = await loadProject(appState.activeProjectPath)
    if (project.success) {
      return {
        success: true,
        project: project.data
      }
    }
  }

  return result
}

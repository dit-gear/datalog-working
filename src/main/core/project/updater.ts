import { ProjectToUpdate, UpdateProjectResult, ProjectType } from '@shared/projectTypes'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import { getActiveProjectPath, getRootPath, getAppPath, getActiveProject } from '../app-state/state'
import { loadProject } from './loader'
import { updateState } from '../app-state/updater'
import logger from '../logger'
import { getMainWindow } from '../../index'

const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath
}

let renamingInProgress = false
let savingInProgress = false

export const updateProjectNameFromFolderRename = async (projectPath: string) => {
  logger.debug('updateProjectNameFromFolderRename started')
  if (renamingInProgress) {
    logger.debug('renamingInProgress is true')
    return
  }
  let project = getActiveProject()
  logger.debug(project ? project.toString() : 'no project!')
  if (!project) return
  const newprojectname = path.basename(projectPath)
  project.settings.project.project_name = newprojectname
  const projectYaml = YAML.stringify(project.settings.project)
  await updateState({ newActiveProject: projectPath })
  try {
    const projectSettingsPath = path.join(getActiveProjectPath(), 'config.yaml')
    fs.writeFileSync(projectSettingsPath, projectYaml, 'utf-8')
    const result = await loadProject(getActiveProjectPath())
    if (result.success) {
      return
    }
    logger.error('updateProjectNameFromFolderRename error')
    return
  } catch (error) {
    logger.error('updateProjectNameFromFolderRename catched error')
    return
  }
}

export const updateProjectFromFile = async () => {
  if (savingInProgress || renamingInProgress) return
  await loadProject(getActiveProjectPath())
  const rootPath = getRootPath()
  const projectPath = getActiveProjectPath()
  const data = getActiveProject()

  const loadedProject: ProjectType = {
    rootPath,
    ...(projectPath && { projectPath }),
    ...(data && { data })
  }
  const mainWindow = await getMainWindow()
  if (mainWindow?.webContents.isLoading()) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('project-loaded', loadedProject)
    })
  } else {
    mainWindow?.webContents.send('project-loaded', loadedProject)
  }
}

export const updateProjectFolder = async (newprojectname: string) => {
  const newpath = path.join(getRootPath(), newprojectname)
  renamingInProgress = true
  try {
    // stop project watchers
    fs.renameSync(getActiveProjectPath(), newpath)
    await updateState({ newActiveProject: newpath })
    //reinitialize project watchers
  } finally {
    renamingInProgress = false
  }
}

export const updateProject = async ({
  update_settings,
  update_email_api
}: ProjectToUpdate): Promise<UpdateProjectResult> => {
  try {
    const projectYaml = YAML.stringify(update_settings.project)
    const globalYaml = YAML.stringify(update_settings.global)

    const newprojectname = update_settings.project.project_name
    const oldprojectname = getFileName(getActiveProjectPath())

    if (newprojectname !== oldprojectname && !renamingInProgress) {
      await updateProjectFolder(newprojectname)
    }
    const projectSettingsPath = path.join(getActiveProjectPath(), 'config.yaml')
    const globalSettingsPath = path.join(getAppPath(), 'config.yaml')
    savingInProgress = true
    try {
      fs.writeFileSync(projectSettingsPath, projectYaml, 'utf8')
      fs.writeFileSync(globalSettingsPath, globalYaml, 'utf8')
      const result = await loadProject(getActiveProjectPath())
      savingInProgress = false
      if (result.success) {
        return {
          success: true,
          project: {
            rootPath: getRootPath(),
            projectPath: getActiveProjectPath(),
            data: result.data
          }
        }
      } else {
        return { success: false, message: 'something went wrong' }
      }
    } finally {
      savingInProgress = false
    }
  } catch (error) {
    return { success: false, message: 'something went wrong' }
  }
}

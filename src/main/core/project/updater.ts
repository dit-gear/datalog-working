import { ProjectToUpdate, UpdateProjectResult } from '@shared/projectTypes'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import {
  getActiveProjectPath,
  getRootPath,
  getAppPath,
  setActiveProjectPath
} from '../app-state/state'
import { loadProject } from './loader'

const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath
}

export const updateProject = async ({
  update_settings,
  update_email_api
}: ProjectToUpdate): Promise<UpdateProjectResult> => {
  // do something
  try {
    const projectYaml = YAML.stringify(update_settings.project)
    const globalYaml = YAML.stringify(update_settings.global)

    const newprojectname = update_settings.project.project_name
    const oldprojectname = getFileName(getActiveProjectPath())

    if (newprojectname !== oldprojectname) {
      const newpath = path.join(getRootPath(), newprojectname)
      await fs.renameSync(getActiveProjectPath(), newpath)
      setActiveProjectPath(newpath)
    }
    const projectSettingsPath = path.join(getActiveProjectPath(), 'settings.yaml')
    const globalSettingsPath = path.join(getAppPath(), 'settings.yaml')
    await fs.writeFileSync(projectSettingsPath, projectYaml, 'utf8')
    await fs.writeFileSync(globalSettingsPath, globalYaml, 'utf8')
    const result = await loadProject(getActiveProjectPath())
    if (result.success) {
      return {
        success: true,
        project: { rootPath: getRootPath(), projectPath: getActiveProjectPath(), data: result.data }
      }
    }

    return { success: false, message: 'something went wrong' }
  } catch (error) {
    return { success: false, message: 'something went wrong' }
  }
}

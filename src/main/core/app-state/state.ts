import { app } from 'electron'
import { ProjectRootType } from '@shared/projectTypes'

let rootPath: string = ''
let activeProjectPath: string = ''
let activeProject: ProjectRootType | null = null
const appPath = app.getPath('userData')

export const getRootPath = (): string => rootPath
export const setRootPath = (newPath: string): void => {
  rootPath = newPath
}

export const getActiveProjectPath = (): string => activeProjectPath
export const setActiveProjectPath = (newProject: string): void => {
  activeProjectPath = newProject
}

export const getActiveProject = (): ProjectRootType | null => activeProject
export const setActiveProject = (newProject: ProjectRootType | null): void => {
  activeProject = newProject
}

export const getAppPath = (): string => appPath

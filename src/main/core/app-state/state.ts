import { app, Tray } from 'electron'
import { ProjectRootType } from '@shared/projectTypes'
import { DatalogDynamicType } from '@shared/datalogTypes'

type ProjectItem = {
  project: string
  path: string
  active: boolean
}

let rootPath: string = ''
let projectsInRootPath: ProjectItem[] | null = null
let activeProjectPath: string = ''
let activeProject: ProjectRootType | null = null
let tray: Electron.Tray | null = null
const appPath = app.getPath('userData')
const datalogStore = new Map<string, DatalogDynamicType>()

export const getRootPath = (): string => rootPath
export const setRootPath = (newPath: string): void => {
  rootPath = newPath
}

export const getProjectsInRootPath = (): ProjectItem[] | null => projectsInRootPath
export const setProjectsInRootPath = (fetchedProjectsInRoot: ProjectItem[]): void => {
  projectsInRootPath = fetchedProjectsInRoot
}

export const getActiveProjectPath = (): string => activeProjectPath
export const setActiveProjectPath = (newProject: string): void => {
  activeProjectPath = newProject
}

export const getActiveProject = (): ProjectRootType | null => activeProject
export const setActiveProject = (newProject: ProjectRootType | null): void => {
  activeProject = newProject
}

export const getTray = (): Electron.Tray | null => tray
export const setTray = (newTray: Tray): void => {
  tray = newTray
}

export const getAppPath = (): string => appPath

export const datalogs = (): Map<string, DatalogDynamicType> => datalogStore

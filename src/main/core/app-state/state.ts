import { app, Tray, BrowserWindow } from 'electron'
import { ProjectRootType, emailType, ProjectInRootMenuItem } from '@shared/projectTypes'
import { DatalogDynamicType, DatalogType } from '@shared/datalogTypes'

let rootPath: string = ''
let projectsInRootPath: ProjectInRootMenuItem[] | null = null
let activeProjectPath: string = ''
let activeProject: ProjectRootType | null = null
let tray: Electron.Tray | null = null
const appPath = app.getPath('userData')
const datalogStore = new Map<string, DatalogDynamicType>()
export const sendWindowDataMap = new Map<
  number,
  { window: BrowserWindow; selectedEmail?: emailType; selection?: DatalogType | DatalogType[] }
>()

export const getRootPath = (): string => rootPath
export const setRootPath = (newPath: string): void => {
  rootPath = newPath
}

export const getProjectsInRootPath = (): ProjectInRootMenuItem[] | null => projectsInRootPath
export const setProjectsInRootPath = (fetchedProjectsInRoot: ProjectInRootMenuItem[]): void => {
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

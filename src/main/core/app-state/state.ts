import { app } from 'electron'
let rootPath: string = ''
let activeProjectPath: string = ''
const appPath = app.getPath('userData')

export const getRootPath = (): string => rootPath
export const setRootPath = (newPath: string): void => {
  rootPath = newPath
}

export const getActiveProjectPath = (): string => activeProjectPath
export const setActiveProjectPath = (newProject: string): void => {
  activeProjectPath = newProject
}

export const getAppPath = (): string => appPath

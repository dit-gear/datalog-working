import { app, BrowserWindow } from 'electron'
import { ProjectRootType, emailType, ProjectInRootMenuItem } from '@shared/projectTypes'
import { DatalogDynamicType, DatalogType } from '@shared/datalogTypes'

//let rootPath: string = ''
//let projectsInRootPath: ProjectInRootMenuItem[] | null = null
//let activeProjectPath: string = ''
//let activeProject: ProjectRootType | null = null
//const appPath = app.getPath('userData')
const datalogStore = new Map<string, DatalogDynamicType>()
export const sendWindowDataMap = new Map<
  number,
  { window: BrowserWindow; selectedEmail?: emailType; selection?: DatalogType | DatalogType[] }
>()

/*export const getRootPath = (): string => rootPath
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

export const getAppPath = (): string => appPath*/

export const datalogs = (): Map<string, DatalogDynamicType> => datalogStore

class AppState {
  private static instance: AppState
  private _rootPath = ''
  private _projectsInRootPath: ProjectInRootMenuItem[] | null = null
  private _activeProjectPath: string | null = null
  private _activeProject: ProjectRootType | null = null
  private readonly _appPath: string = app.getPath('userData')

  private constructor() {}

  public static getInstance() {
    if (!AppState.instance) {
      AppState.instance = new AppState()
    }
    return AppState.instance
  }

  get rootPath(): string {
    return this._rootPath
  }
  set rootPath(path: string) {
    this._rootPath = path
  }

  get projectsInRootPath(): ProjectInRootMenuItem[] | null {
    return this._projectsInRootPath
  }
  set projectsInRootPath(projects: ProjectInRootMenuItem[] | null) {
    this._projectsInRootPath = projects
  }

  get activeProjectPath(): string {
    return this._activeProjectPath ?? ''
  }
  set activeProjectPath(path: string | null) {
    this._activeProjectPath = path
  }

  get activeProject(): ProjectRootType | null {
    return this._activeProject
  }
  set activeProject(project: ProjectRootType | null) {
    this._activeProject = project
  }

  get appPath(): string {
    return this._appPath
  }
}

export const appState = AppState.getInstance()

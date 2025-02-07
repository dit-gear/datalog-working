import { app, BrowserWindow } from 'electron'
import {
  ProjectRootType,
  emailType,
  ProjectInRootMenuItem,
  ProjectType
} from '@shared/projectTypes'
import { DatalogDynamicType, DatalogType } from '@shared/datalogTypes'

const datalogStore = new Map<string, DatalogDynamicType>()
export const sendWindowDataMap = new Map<
  number,
  {
    window: BrowserWindow
    selectedEmail: emailType | null
    selection?: DatalogType | DatalogType[]
  }
>()

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

  get project(): ProjectType {
    return {
      rootPath: this._rootPath,
      ...(this._activeProjectPath && { projectPath: this._activeProjectPath }),
      ...(this._activeProject && { data: this._activeProject })
    }
  }
}

export const appState = AppState.getInstance()

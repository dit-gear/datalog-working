import { app, BrowserWindow } from 'electron'
import path from 'path'
import crypto from 'crypto'
import { ProjectRootType, emailType, ProjectMenuItem, ProjectType } from '@shared/projectTypes'
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
  private _projectsInRootPath: ProjectMenuItem[] | null = null
  private _activeProjectPath: string | null = null
  private _activeProjectData: ProjectRootType | null = null
  private readonly _appPath: string = app.getPath('userData')
  private readonly _folderPath: string = path.join(app.getPath('documents'), 'Datalog')
  private readonly _localsharedPath: string = path.join(this._folderPath, 'LocalShared')
  private readonly _projectsPath: string = path.join(this._folderPath, 'Projects')
  private readonly _sessionId: string = crypto.randomUUID()

  private constructor() {}

  public static getInstance() {
    if (!AppState.instance) {
      AppState.instance = new AppState()
    }
    return AppState.instance
  }

  get projectsInRootPath(): ProjectMenuItem[] | null {
    return this._projectsInRootPath
  }
  set projectsInRootPath(projects: ProjectMenuItem[] | null) {
    this._projectsInRootPath = projects
  }

  get activeProjectPath(): string {
    return this._activeProjectPath ?? ''
  }
  set activeProjectPath(path: string | null) {
    this._activeProjectPath = path
  }

  get project(): ProjectType {
    return this._activeProjectData
  }
  set project(project: ProjectType) {
    this._activeProjectData = project
  }

  get appPath(): string {
    return this._appPath
  }

  get folderPath(): string {
    return this._folderPath
  }

  get localSharedPath(): string {
    return this._localsharedPath
  }

  get projectsPath(): string {
    return this._projectsPath
  }
  get sessionId(): string {
    return this._sessionId
  }
}

export const appState = AppState.getInstance()

import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  IpcMainEvent,
  dialog,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  session
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { loadStateFromFile, saveStateToFile, state } from './utils/appState'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import { z } from 'zod'
import {
  FileInfo,
  ProjectType,
  CreateNewProjectResult,
  LoadProjectDataResult,
  entryType,
  ProjectSchema,
  DirectoryFile,
  LoadedFile
} from '../types'
import path from 'path'
import YAML from 'yaml'
import processALE from './utils/process-ale'
import processMHL from './utils/process-mhl'
import getVolumeName from './utils/get-volume'
import findFilesByType from './utils/find-files-by-type'
import { sendInitialDirectories, watchDirectories } from './utils/editor-file-handler'
import { moveFileToTrash } from './utils/crud'

function updateEnabledMenuItem(newId: string, previousId?: string): void {
  const menu = Menu.getApplicationMenu()
  const newSelectedItem = menu?.getMenuItemById(newId)
  const previousSelectedItem = previousId && menu ? menu?.getMenuItemById(previousId) : null

  if (previousSelectedItem) {
    previousSelectedItem.enabled = true
  }
  if (newSelectedItem) {
    newSelectedItem.enabled = false
  }
}

type ProjectItem = {
  project: string
  path: string
  active: boolean
}
const menuTemplate = (projects: ProjectItem[] | undefined): MenuItemConstructorOptions[] => [
  {
    label: 'Application',
    submenu: [
      {
        label: 'About Application',
        click: (): void => {
          console.log('About clicked')
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: (): void => {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'Project',
    submenu: [
      {
        label: 'New Project',
        click: (): void => {
          mainWindow.webContents.send('new-project', true)
        }
      },
      {
        id: 'openProject',
        label: 'Open',
        enabled: projects && projects.length > 0,
        submenu: projects
          ? projects.map((project) => ({
              id: project.path,
              label: project.project,
              enabled: !project.active,
              click: (): Promise<void> => handleChangeProject(project.path)
            }))
          : [{ label: 'No Projects in folder', enabled: false }]
      },
      { type: 'separator' },
      {
        label: 'Change Root folder',
        click: (): Promise<void> => handleRootDirChange()
      },
      {
        label: 'Exit',
        click: (): void => {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'Export',
    submenu: [
      {
        label: 'Export Datalog',
        click: (): void => {
          console.log('Export to PDF clicked')
        }
      },
      {
        label: 'Export QC Report',
        click: (): void => {
          console.log('Send Email clicked')
        }
      }
    ]
  },
  {
    label: 'Templates',
    submenu: [{ label: 'Launch Template Editor', click: (): void => createEditorWindow() }]
  },
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', role: 'undo' },
      { label: 'Redo', role: 'redo' },
      { type: 'separator' },
      { label: 'Cut', role: 'cut' },
      { label: 'Copy', role: 'copy' },
      { label: 'Paste', role: 'paste' }
    ]
  }
]

// Initialize the application
app.setName('Datalog')
let mainWindow: BrowserWindow
let editorWindow: BrowserWindow | null
let rootPath: string
let projectPath: string
let appPath: string

async function performPreWindowSetup(): Promise<ProjectType> {
  const documentsPath = app.getPath('documents')
  const defaultRootPath = path.join(documentsPath, 'Datalog')
  appPath = app.getPath('userData')
  const configFile = path.join(appPath, 'config.json') as string

  const config = await getConfig(configFile, defaultRootPath)
  rootPath = config.rootPath
  projectPath = config.activeProject
  await loadProjectsInRootPath()

  if (projectPath) {
    console.log('theres a projectpath')
    const activeProject = await loadProject(projectPath)
    if (activeProject.success) {
      return { rootPath, projectPath, data: activeProject.data }
    }
    if (!activeProject.success && activeProject.message) {
      console.error(activeProject.message)
    }
  }
  return { rootPath }

  async function getConfig(configFile: string, defaultPath: string): Promise<state> {
    if (fs.existsSync(configFile)) {
      const config = await loadStateFromFile(configFile)
      if (!('error' in config)) {
        return config
      }
    }
    if (!fs.existsSync(defaultPath)) {
      fs.mkdirSync(defaultPath)
    }
    await saveDefaultConfig(configFile, defaultPath)
    return { rootPath: defaultPath, activeProject: '' }
  }

  // Save default configuration
  async function saveDefaultConfig(configFile: string, defaultPath: string): Promise<void> {
    const defaultConfig: state = { rootPath: defaultPath, activeProject: '' }
    const saveError = await saveStateToFile(configFile, defaultConfig)
    if (saveError) {
      dialog.showErrorBox('Error', saveError.message)
      console.error('Failed to save default configuration:', saveError.message)
    }
  }
}

// Create Editor window
function createEditorWindow(): void {
  if (editorWindow) {
    editorWindow.focus()
    return
  }

  editorWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })
  editorWindow.webContents.openDevTools()

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    editorWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/editor.html`)
  } else {
    editorWindow.loadFile(join(__dirname, '../renderer/editor.html'))
  }

  editorWindow.on('closed', () => {
    editorWindow = null
  })
  editorWindow.webContents.once('did-finish-load', () => {
    watchDirectories(editorWindow!, projectPath, appPath)
  })
  ipcMain.handle('get-initial-data', () => {
    return sendInitialDirectories(projectPath, appPath)
  })
  ipcMain.on('request-read-file', (event, file: DirectoryFile) => {
    try {
      const ext = path.extname(file.path).toLowerCase()
      const fileTypeMap: { [key: string]: 'jsx' | 'tsx' } = {
        '.jsx': 'jsx',
        '.tsx': 'tsx'
      }
      const filetype = fileTypeMap[ext]

      if (!filetype) {
        throw new Error('Unsupported file type')
      }

      const content = fs.readFileSync(file.path, 'utf8')

      const loadedFile: LoadedFile = {
        ...file,
        content,
        filetype
      }
      event.sender.send('response-read-file', loadedFile)
    } catch (error) {
      event.sender.send('response-read-file', { error: (error as Error).message })
    }
  })
  ipcMain.handle('save-file', async (event, file: LoadedFile) => {
    try {
      console.log('isNewFile:', file.isNewFile)
      console.log('File exists:', fs.existsSync(file.path))
      if (file.isNewFile) {
        // Check if the file already exists
        if (fs.existsSync(file.path)) {
          console.log('File already exists, throwing error.')
          throw new Error('File already exists')
        }
      }
      fs.writeFileSync(file.path, file.content, 'utf8')
      delete file.isNewFile
      event.sender.send('response-read-file', file)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  })
  ipcMain.handle('delete-file', async (_event, file: DirectoryFile) => {
    return moveFileToTrash(file.path)
  })
}

function createWindow(loadedProject: ProjectType): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })
  mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('project-loaded', loadedProject)
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/index.html`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  session.defaultSession.clearCache()
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  performPreWindowSetup().then((res) => createWindow(res))
  //createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
      performPreWindowSetup().then((res) => createWindow(res))
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
async function loadProjectsInRootPath(): Promise<void> {
  const yamlFiles = await findFilesByType(rootPath, 'yaml', {
    includeFileName: 'settings.yaml'
  })
  const ProjectSchema = z.object({
    project_name: z.string(),
    folder_template: z.string()
  })

  const projects = await Promise.all(
    yamlFiles?.map(async (filePath) => {
      const project = fs.readFileSync(filePath, 'utf8')
      const folderPath = path.dirname(filePath)
      const yaml = YAML.parse(project)
      const parsedYaml = ProjectSchema.parse(yaml)
      return {
        project: parsedYaml.project_name,
        path: folderPath,
        active: projectPath ? projectPath === folderPath : false
      }
    })
  )
  const menu = Menu.buildFromTemplate(
    menuTemplate(projects && projects) as (MenuItemConstructorOptions | MenuItem)[]
  )
  Menu.setApplicationMenu(menu)
}

const handleChangeProject = async (selectedProjectPath: string): Promise<void> => {
  const activeProject = await loadProject(selectedProjectPath)
  const previousPath = projectPath
  projectPath = selectedProjectPath
  const saving = await saveStateToFile(path.join(app.getPath('userData'), 'config.json'), {
    rootPath,
    activeProject: selectedProjectPath
  })
  if (saving?.error) {
    dialog.showErrorBox('Error', saving.message)
  }
  const data = activeProject.data
  updateEnabledMenuItem(projectPath, previousPath)
  mainWindow.webContents.send('project-loaded', {
    rootPath,
    projectPath,
    data
  })
}

const handleRootDirChange = async (): Promise<void> => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled) {
    return
  } else {
    rootPath = result.filePaths[0].endsWith('/Datalog')
      ? result.filePaths[0]
      : path.join(result.filePaths[0], 'Datalog')
    projectPath = ''
    if (!fs.existsSync(rootPath)) {
      fs.mkdirSync(rootPath)
    }
    const saving = await saveStateToFile(path.join(app.getPath('userData'), 'config.json'), {
      rootPath,
      activeProject: projectPath
    })
    if (saving?.error) {
      dialog.showErrorBox('Error', saving.message)
    }
    await loadProjectsInRootPath()
    mainWindow.webContents.send('project-loaded', {
      rootPath,
      projectPath
    })
  }
}

ipcMain.handle(
  'create-new-project',
  async (event, projectName: string): Promise<CreateNewProjectResult> => {
    const newProjectPath = path.join(rootPath, projectName) as string
    const filepath = path.join(newProjectPath, 'settings.yaml') as string
    const defaultYaml = {
      project_name: projectName,
      folder_template: 'D<dd>_<yymmdd>'
    }
    const yaml = YAML.stringify(defaultYaml)
    if (fs.existsSync(newProjectPath))
      return {
        success: false,
        message: 'Project with the same name already exists in directory'
      }
    try {
      fs.mkdirSync(newProjectPath)
      fs.writeFileSync(filepath, yaml, 'utf8')
      projectPath = newProjectPath
      const saving = await saveStateToFile(path.join(app.getPath('userData'), 'config.json'), {
        rootPath,
        activeProject: projectPath
      })
      if (saving?.error) {
        dialog.showErrorBox('Error', saving.message)
      }
      await loadProjectsInRootPath()
      return {
        success: true,
        project: {
          rootPath,
          projectPath,
          data: defaultYaml
        }
      }
    } catch (error) {
      dialog.showErrorBox('Error', 'Failed to create project')
      return { success: false }
    }
  }
)
const loadProject = async (selectedProjectpath: string): Promise<LoadProjectDataResult> => {
  const filepath = path.join(selectedProjectpath, 'settings.yaml') as string
  if (!fs.existsSync(filepath)) {
    return { success: false, message: 'Project not found' }
  }

  try {
    const yaml = fs.readFileSync(filepath, 'utf8')
    const parsedSettings = YAML.parse(yaml)
    const data = ProjectSchema.parse(parsedSettings)
    return { success: true, data }
  } catch (error) {
    dialog.showErrorBox('Error', 'Failed to load project settings')
    return {
      success: false,
      message:
        'Invalid settings structure. Check settings.yaml in project folder and correct any errors'
    }
  }
}

ipcMain.handle('findOcf', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (result.canceled) return // Handle user canceling the dialog

    const volumeName = getVolumeName(result.filePaths[0])
    const mhlFiles = await findFilesByType(result.filePaths[0], 'mhl')
    const aleFiles = await findFilesByType(result.filePaths[0], 'ale')
    if (mhlFiles.length === 0) {
      dialog.showErrorBox('Error', 'No MHL files found in the selected directory.')
      return
    } else {
      const aleData = await processALE(aleFiles)
      const data = await processMHL(mhlFiles, mainWindow)
      // merge aleData and data that have the same Clip name
      const mergedData = data.map((item) => {
        const aleItem = aleData.find((ale) => ale.Clip === item.Clip)
        return { ...aleItem, ...item, Volume: volumeName }
      })

      return { volume: [volumeName], data: mergedData }
    }
  } catch (error) {
    dialog.showErrorBox('Error', 'Failed to read MHL files')
    return
  }
})

ipcMain.handle('getOfflineFolderDetails', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return { folderSize: 0, files: [] }
  }

  const folderPath = result.filePaths[0]
  const getFolderDetails = (dirPath: string): { folderSize: number; files: FileInfo[] } => {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    let folderSize = 0
    const fileDetails: FileInfo[] = []

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const stats = fs.statSync(fullPath)

      if (entry.isDirectory()) {
        const subfolderDetails = getFolderDetails(fullPath)
        folderSize += subfolderDetails.folderSize
        fileDetails.push(...subfolderDetails.files)
      } else if (entry.isFile()) {
        folderSize += stats.size
        fileDetails.push({
          filename: entry.name.split('.')[0],
          size: stats.size
        })
      }
    }

    return { folderSize, files: fileDetails }
  }

  const { folderSize, files: fileDetails } = getFolderDetails(folderPath)

  return { folderPath, folderSize, files: fileDetails }
})

ipcMain.handle('getDocumentsFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return result.filePaths[0]
  }
})

ipcMain.handle('getFolderPath', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null
  } else {
    return result.filePaths[0]
  }
})

ipcMain.handle('save-entry', async (event, data: entryType) => {
  try {
    const yaml = YAML.stringify(data)
    const filepath = path.join(projectPath, `${data.Folder}.yaml`)
    fs.writeFileSync(filepath, yaml, 'utf8')
    return { success: true }
  } catch (error) {
    dialog.showErrorBox('Error', 'Failed to save entry')
    return { success: false }
  }
})

ipcMain.handle('load-entries', async () => {
  try {
    const entriesPaths = (await findFilesByType(projectPath, 'yaml')).filter(
      (filePath) => !path.basename(filePath).toLowerCase().includes('settings.yaml')
    )
    const entries = entriesPaths.map((entryPath): entryType => {
      const entry = fs.readFileSync(entryPath, 'utf8')
      const parsedEntry = YAML.parse(entry)
      return parsedEntry
    })
    return entries
  } catch (error) {
    dialog.showErrorBox('Error', 'Failed to load entries')
    return []
  }
})

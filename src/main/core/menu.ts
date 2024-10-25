import { Menu, app, Tray, nativeImage } from 'electron'
import { getMainWindow, openMainWindow } from '../index'
import { OpenModalTypes } from '@shared/shared-types'
import { getTray, setTray, getProjectsInRootPath } from './app-state/state'
import { handleChangeProject } from './project/manager'
import { handleRootDirChange } from './app-state/updater'
import { createEditorWindow } from '../editor/editorWindow'
import { createSendWindow } from '../send/sendWindow'
import appIcon from '../../../build/tray_icon_template.png?asset'

type ProjectItem = {
  project: string
  path: string
  active: boolean
}

const handleOpenModalInDatalog = async (modal: OpenModalTypes): Promise<void> => {
  const mainWindow = await getMainWindow()
  if (mainWindow.webContents.isLoading()) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('open-modal-datalogWindow', modal)
    })
  } else {
    mainWindow.webContents.send('open-modal-datalogWindow', modal)
  }
}

const buildContextMenu = (projects: ProjectItem[] | null): Menu => {
  const activeProject = projects?.find((proj) => proj.active)
  return Menu.buildFromTemplate([
    {
      id: 'active',
      label: `Project: ${activeProject ? activeProject.project : 'None'}`,
      enabled: false
    },

    { label: 'Show Datalog', click: (): Promise<void> => openMainWindow() }, // Opens main window
    { type: 'separator' },
    { label: 'Send', submenu: [{ label: 'Datalog', click: (): void => createSendWindow() }] }, // Will open Send window
    {
      label: 'Export',
      submenu: [{ label: 'Datalog', click: (): void => console.log('Export clicked') }]
    },
    { type: 'separator' },
    {
      label: 'New Shooting Day',
      click: () => handleOpenModalInDatalog('new-shooting-day')
    },
    { type: 'separator' },
    {
      label: 'Project',
      submenu: [
        {
          id: 'openProject',
          label: 'Switch Project',
          enabled: !!projects && projects.length > 0,
          submenu: projects
            ? projects.map((project) => ({
                id: project.path,
                label: project.project,
                enabled: !project.active,
                click: (): Promise<void> => handleChangeProject(project.path)
              }))
            : [{ label: 'No Projects in folder', enabled: false }]
        },
        {
          label: 'New Project',
          click: () => handleOpenModalInDatalog('new-project')
        },
        { type: 'separator' },
        { label: 'Change Root Folder', click: (): Promise<void> => handleRootDirChange() }
      ]
    },

    { label: 'Code Editor', click: (): void => createEditorWindow() }, // Opens code editor window.
    { label: 'Project Settings', click: () => handleOpenModalInDatalog('project-settings') }, // Opens main window and open settings modal.
    { type: 'separator' },
    { label: 'Help', submenu: [{ label: 'Docs' }, { label: 'Discord' }] },
    { label: 'About' },
    { type: 'separator' },
    { label: 'Log in', enabled: false },
    {
      label: 'Quit',
      click: (): void => {
        app.quit()
      }
    }
  ])
}

export const createTray = (projects: ProjectItem[] | null): void => {
  let trayicon = nativeImage.createFromPath(appIcon)
  trayicon = trayicon.resize({ width: 32, height: 32 })
  let tray = new Tray(trayicon)

  const contextMenu = buildContextMenu(projects)

  Menu.setApplicationMenu(contextMenu)
  tray.setContextMenu(contextMenu)
  setTray(tray)
}

export const updateTray = (): void => {
  const tray = getTray()
  const projects = getProjectsInRootPath()
  if (!tray) {
    createTray(projects)
    return
  }
  const contextMenu = buildContextMenu(projects)
  Menu.setApplicationMenu(contextMenu)
  tray.setContextMenu(contextMenu)
}

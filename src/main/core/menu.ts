import { Menu, app, Tray } from 'electron'
import { getDatalogWindow } from '../datalog/datalogWindow'
import { OpenModalTypes } from '@shared/shared-types'
import { ProjectRootType, ProjectInRootMenuItem } from '@shared/projectTypes'
import { appState } from './app-state/state'
import { handleChangeProject } from './project/manager'
import { handleRootDirChange } from './app-state/updater'
import { createEditorWindow } from '../editor/editorWindow'
import { createSendWindow } from '../send/sendWindow'
import { exportPdf } from './export/exportPdf'
import trayIcon from '../../../resources/trayIcon.png?asset'

// pass active project!
const buildContextMenu = (
  projects: ProjectInRootMenuItem[] | null,
  activeProject: ProjectRootType | null
): Menu => {
  return Menu.buildFromTemplate([
    {
      id: 'active',
      label: `Project: ${activeProject ? activeProject.project_name : 'None'}`,
      enabled: false
    },

    {
      label: 'Open Datalog Window',
      click: () => getDatalogWindow({ ensureOpen: true }),
      enabled: Boolean(activeProject)
    }, // Opens main window
    { type: 'separator' },
    {
      label: 'Send',
      submenu: [
        ...(activeProject?.emails?.map((email, index) => ({
          id: index.toString(),
          label: email.name,
          click: (): void => createSendWindow(email)
        })) || [{ label: 'No Emails Available', enabled: false }]),
        { type: 'separator' },
        { id: 'sendWindow', label: 'Open Send Window', click: (): void => createSendWindow() }
      ],
      enabled: Boolean(activeProject)
    }, // Will open Send window
    {
      label: 'Export',
      submenu: activeProject?.pdfs?.map((pdf) => ({
        id: pdf.id,
        label: pdf.name,
        click: () => exportPdf({ pdf })
      })) || [{ label: 'No PDFs Available', enabled: false }],
      enabled: Boolean(activeProject)
    },
    { type: 'separator' },
    {
      label: 'New Shooting Day',
      click: () => getDatalogWindow({ navigate: 'builder' }),
      enabled: Boolean(activeProject)
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
          click: () => getDatalogWindow({ navigate: 'new-project' })
        },
        { type: 'separator' },
        { label: 'Change Root Folder', click: (): Promise<void> => handleRootDirChange() }
      ]
    },

    { label: 'Code Editor', click: (): void => createEditorWindow() }, // Opens code editor window.
    {
      label: 'Project Settings',
      click: () => getDatalogWindow({ navigate: 'settings' }),
      enabled: Boolean(activeProject)
    }, // Opens main window and open settings modal.
    { type: 'separator' },
    { label: 'Help', submenu: [{ label: 'Docs' } /*{ label: 'Discord' }*/] },
    { label: 'About' },
    { type: 'separator' },
    /*{ label: 'Log in', enabled: false },*/
    {
      label: 'Quit',
      click: (): void => {
        app.quit()
      }
    }
  ])
}

class TrayManager {
  private tray: Electron.Tray | null = null

  createOrUpdateTray(): void {
    const contextMenu = buildContextMenu(appState.projectsInRootPath, appState.activeProject)
    if (!this.tray) {
      this.tray = new Tray(trayIcon) // Create the tray if it doesn't exist
    }
    this.tray.setContextMenu(contextMenu) // Update the context menu
  }

  updateTooltip(tooltip: string) {
    if (this.tray) {
      this.tray.setToolTip(tooltip)
    }
  }

  destroyTray() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}

const trayManager = new TrayManager()
export default trayManager

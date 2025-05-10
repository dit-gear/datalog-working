import { Menu, Tray, nativeImage, shell } from 'electron'
import { getDatalogWindow } from '../datalog/datalogWindow'
import { ProjectRootType, ProjectMenuItem } from '@shared/projectTypes'
import { appState } from './app-state/state'
import { handleChangeProject } from './project/manager'
import { createEditorWindow } from '../editor/editorWindow'
import { createSendWindow } from '../send/sendWindow'
import { exportPdf } from './export/exportPdf'
import trayIcon from '../../../resources/tray.png?asset'
import logger from './logger'
import { createAboutWindow } from '../about/aboutWindow'

interface buildContextMenuProps {
  projects: ProjectMenuItem[] | null
  activeProject: ProjectRootType | null
}

const baseMenu = (): Menu => {
  return Menu.buildFromTemplate([
    {
      label: 'Datalog',
      role: 'appMenu',
      submenu: [
        { label: 'About', click: () => createAboutWindow() },
        { type: 'separator' },
        { label: 'Hide', role: 'hide' },
        { label: 'Hide Others', role: 'hideOthers' },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
      ]
    }
  ])
}

const buildContextMenu = ({ projects, activeProject }: buildContextMenuProps): Menu => {
  logger.debug('creating menu...')

  return Menu.buildFromTemplate([
    {
      id: 'active',
      label: `Project: ${activeProject ? activeProject.project_name : 'None'}`,
      enabled: false
    },

    {
      label: 'Open Dashboard',
      click: () => getDatalogWindow({ ensureOpen: true }),
      enabled: Boolean(activeProject)
    }, // Opens main window
    { type: 'separator' },
    {
      label: 'Send',
      submenu: [
        ...(activeProject?.emails
          ?.filter((email) => email.enabled)
          .map((email, index) => ({
            id: index.toString(),
            label: email.label,
            click: (): void => createSendWindow(email)
          })) || [{ label: 'No Emails Available', enabled: false }]),
        { type: 'separator' },
        { id: 'sendWindow', label: 'Open Send Window', click: (): void => createSendWindow(null) }
      ],
      enabled: Boolean(activeProject)
    }, // Will open Send window
    {
      label: 'Export',
      submenu: activeProject?.pdfs
        ?.filter((pdf) => pdf.enabled)
        .map((pdf) => ({
          id: pdf.id,
          label: pdf.label,
          click: () => exportPdf({ pdf, hasDialog: true })
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
                label: project.label,
                enabled: !project.active,
                click: (): Promise<void> => handleChangeProject(project.path)
              }))
            : [{ label: 'No Projects in folder', enabled: false }]
        },
        { label: 'New Project', click: () => getDatalogWindow({ navigate: 'new-project' }) },
        { type: 'separator' },
        { label: 'Open Folder', click: async () => await shell.openPath(appState.folderPath) }
      ]
    },

    {
      label: 'Code Editor',
      click: (): void => createEditorWindow(),
      enabled: Boolean(activeProject)
    }, // Opens code editor window.
    {
      label: 'Project Settings',
      click: () => getDatalogWindow({ navigate: 'settings' }),
      enabled: Boolean(activeProject)
    }, // Opens main window and open settings modal.
    { type: 'separator' },
    { label: 'Help', submenu: [{ label: 'Docs' } /*{ label: 'Discord' }*/] },
    { label: 'About', click: () => createAboutWindow() },
    { type: 'separator' },
    /*{ label: 'Log in', enabled: false },*/
    { label: 'Quit', role: 'quit' }
  ])
}

class TrayManager {
  private tray: Electron.Tray | null = null

  createOrUpdateTray(): void {
    const contextMenu = buildContextMenu({
      projects: appState.projectsInRootPath,
      activeProject: appState.project
    })
    if (!this.tray) {
      Menu.setApplicationMenu(baseMenu())
      const image = nativeImage.createFromPath(trayIcon)
      image.setTemplateImage(true)
      this.tray = new Tray(image) // Create the tray if it doesn't exist
      console.log('created new menu')
    }
    this.tray.setContextMenu(contextMenu) // Update the context menu
    console.log('updated menu')
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

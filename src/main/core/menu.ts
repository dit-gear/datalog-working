import { Menu, MenuItemConstructorOptions, app } from 'electron'
import { getMainWindow } from '../index'
import { handleChangeProject } from './project/manager'
import { handleRootDirChange } from './app-state/updater'
import { createEditorWindow } from '../editor/editorWindow'

type ProjectItem = {
  project: string
  path: string
  active: boolean
}

export function updateEnabledMenuItem(newId: string, previousId?: string): void {
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

export const menuTemplate = (projects: ProjectItem[] | undefined): MenuItemConstructorOptions[] => [
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
          getMainWindow()?.webContents.send('new-project', true)
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

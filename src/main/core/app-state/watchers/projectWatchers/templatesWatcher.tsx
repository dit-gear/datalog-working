import chokidar, { FSWatcher } from 'chokidar'
import { appState } from '../../state'
import logger from '../../../logger'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { ensureDirectoryExists } from '../../../../utils/crud'
import { getTemplateDirectories } from '../../../project/loader'
import { getEditorWindow } from '../../../../editor/editorWindow'
import path from 'path'
import fs from 'fs'
import { getDatalogWindow } from '../../../../datalog/datalogWindow'

let templatesWatcher: FSWatcher | null = null

const resolveTemplate = (
  filePath: string,
  directories: TemplateDirectoryFile[]
): TemplateDirectoryFile | null => {
  const match = directories.find((dir) => filePath.startsWith(dir.path))
  return match
    ? { path: filePath, name: path.basename(filePath), type: match.type, scope: match.scope }
    : null
}

const isValidTemplateFile = (filePath: string, action: 'add' | 'remove'): boolean => {
  const { dirs } = getTemplateDirectories()
  const isInDirectory = dirs.some((dir) => filePath.startsWith(dir))
  if (!isInDirectory) {
    return false
  }

  // Check if the file ends with .tsx or .jsx
  const hasValidExtension = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
  if (!hasValidExtension) {
    return false
  }

  if (action === 'add') {
    // Only check existence for add actions
    try {
      const stat = fs.statSync(filePath)
      return stat.isFile()
    } catch (error) {
      // If the file doesn't exist or another error occurs, return false
      return false
    }
  }

  // For 'remove' actions, no need to check existence
  return true
}

export const initTemplateWatcher = async () => {
  const { dirs, subdirs } = getTemplateDirectories()

  // Ensure directories exist
  await Promise.all(subdirs.map(ensureDirectoryExists))

  templatesWatcher = chokidar.watch(dirs, { ignoreInitial: true })

  templatesWatcher.on('ready', () => {
    logger.debug('templatesWatcher started')
    if (templatesWatcher) {
      const watched = templatesWatcher.getWatched()

      // Transform the watched object into an array suitable for console.table
      const tableData = Object.entries(watched).map(([directory, files]) => ({
        Directory: directory,
        Files: files.join(', ')
      }))

      // Display the table in the console
      console.table(tableData)
    }
  })
  templatesWatcher.on('error', (error) => logger.error('TemplateWatcher error:', error))
  templatesWatcher.on('add', (filePath) => updateTemplatesDir(filePath, 'add'))
  templatesWatcher.on('unlink', (filePath) => updateTemplatesDir(filePath, 'remove'))
  templatesWatcher.on('unlinkDir', async (dirPath) => {
    const dirName = path.basename(dirPath)
    if (!['templates', 'email', 'pdf'].includes(dirName)) return

    logger.warn(`Directory deleted: ${dirPath}. Closing watcher and reinitializing.`)

    try {
      await closeTemplatesWatcher()
      await initTemplateWatcher()
    } catch (error) {
      logger.error('Error reinitializing templatesWatcher:', error)
    }
  })
}

const updateTemplatesDir = (filePath: string, action: 'add' | 'remove') => {
  if (filePath.endsWith('mockData.json')) {
    const editorWindow = getEditorWindow()
  }
  if (!isValidTemplateFile(filePath, action)) return
  const activeProject = appState.activeProject
  if (!activeProject) return

  const { templatesDir } = activeProject

  if (action === 'add') {
    const { detailed: directories } = getTemplateDirectories()
    const newTemplate = resolveTemplate(filePath, directories)
    if (!newTemplate) return
    activeProject.templatesDir = [...templatesDir, newTemplate]
  } else if (action === 'remove') {
    activeProject.templatesDir = templatesDir.filter((template) => template.path !== filePath)
  }
  appState.activeProject = activeProject
  const editorWindow = getEditorWindow()
  getDatalogWindow({ update: true })
  if (editorWindow) {
    editorWindow.webContents.send('directory-changed', activeProject.templatesDir)
  }
}

export const closeTemplatesWatcher = async () => {
  if (templatesWatcher) {
    try {
      logger.debug('Closing templatesWatcher...')
      await templatesWatcher.close()
      logger.debug('templatesWatcher closed successfully.')
    } catch (error) {
      logger.error('Error closing templatesWatcher:', error)
    } finally {
      templatesWatcher = null
    }
  } else {
    logger.debug('templatesWatcher is already closed or was never initialized.')
  }
}

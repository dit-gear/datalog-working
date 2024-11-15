import chokidar, { FSWatcher } from 'chokidar'
import { getActiveProjectPath, getAppPath, getActiveProject, setActiveProject } from '../../state'
import logger from '../../../logger'
import { TemplateDirectoryFile } from '@shared/projectTypes'
import { ensureDirectoryExists } from '../../../../utils/crud'
import path from 'path'

let templatesWatcher: FSWatcher | null = null

export const initTemplateWatcher = async () => {
  const projectPath = getActiveProjectPath()
  const appPath = getAppPath()
  if (!projectPath) throw Error

  const directories = [
    `${projectPath}/templates/email`,
    `${projectPath}/templates/pdf`,
    `${appPath}/templates/email`,
    `${appPath}/templates/pdf`
  ]

  // Ensure directories exist
  await Promise.all(directories.map(ensureDirectoryExists))

  const watchPattern = `${projectPath}/templates/{email,pdf}/*.{jsx,tsx},${appPath}/templates/{email,pdf}/*.{jsx,tsx}`

  templatesWatcher = chokidar.watch(watchPattern, { ignoreInitial: true })

  templatesWatcher.on('ready', () => logger.debug('templateWatcher started'))
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
  const activeProject = getActiveProject()
  if (!activeProject) return

  const { templatesDir } = activeProject

  if (action === 'add') {
    // Determine file type and scope based on file path
    const type = filePath.includes('/email') ? 'email' : 'pdf'

    // Add the new file entry to templatesDir
    const newTemplate: TemplateDirectoryFile = { path: filePath, type, scope: 'project' }
    activeProject.templatesDir = [...templatesDir, newTemplate]
  } else if (action === 'remove') {
    // Remove the file entry from templatesDir
    activeProject.templatesDir = templatesDir.filter((template) => template.path !== filePath)
  }
  // Update active project with modified templatesDir
  setActiveProject(activeProject)
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

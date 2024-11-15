import chokidar, { FSWatcher } from 'chokidar'
import { getActiveProjectPath, datalogs } from '../../state'
import { parseDatalog } from '../../../datalog/loader'
import logger from '../../../logger'
import { getMainWindow } from '../../../../index'
import fs from 'fs/promises'
import path from 'path'

let datalogsWatcher: FSWatcher | null = null

let debouncedUpdate: NodeJS.Timeout | null = null

export const initDatalogWatcher = async () => {
  const projectPath = getActiveProjectPath()
  if (!projectPath) throw new Error('Project path not found in initDatalogWatcher')

  const files = await fs.readdir(projectPath)

  files.forEach((file) => {
    logger.debug(`File in projectPath: ${file}`)
  })
  const absolutePath = path.resolve(projectPath)
  const watchPattern = `${absolutePath}/*.datalog`
  datalogsWatcher = chokidar.watch(watchPattern, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true
  })

  datalogsWatcher.on('ready', () => {
    logger.debug('datalogsWatcher started')
  })
  datalogsWatcher.on('error', (error) => logger.error('datalogsWatcher error:', error))

  datalogsWatcher.on('all', (event, filepath) => {
    logger.debug(`Event: ${event}, File: ${filepath}`)
  })

  datalogsWatcher.on('add', async (filepath) => {
    logger.debug(`Parsing datalog for file: ${filepath}`)
    try {
      const datalog = await parseDatalog(filepath)
      logger.debug(`Parsed datalog: ${filepath}`)
      datalogs().set(filepath, datalog)
      logger.debug(`File added during initialization: ${filepath}`)
      debounceIpcUpdate()
    } catch (error) {
      logger.error(`datalogWatcher add error (${filepath}):`, error)
    }
  })

  datalogsWatcher.on('change', async (filepath) => {
    try {
      const datalog = await parseDatalog(filepath)
      datalogs().set(filepath, datalog)
      debounceIpcUpdate()
    } catch (error) {
      datalogs().delete(filepath)
      debounceIpcUpdate()
    }
  })

  datalogsWatcher.on('unlink', (filepath) => {
    datalogs().delete(filepath)
    debounceIpcUpdate()
  })
}

const debounceIpcUpdate = () => {
  if (debouncedUpdate) clearTimeout(debouncedUpdate)

  debouncedUpdate = setTimeout(() => {
    debouncedUpdate = null
    sendIpcUpdate()
  }, 300) // Adjust debounce duration as needed
}

// Function to send IPC update
const sendIpcUpdate = async () => {
  const allDatalogs = Array.from(datalogs().values())
  logger.debug(`Current datalogs map: ${JSON.stringify(Array.from(datalogs().entries()))}`)
  const mainWindow = await getMainWindow()
  if (mainWindow) {
    mainWindow.webContents.send('datalogs-loaded', allDatalogs)
  }
}

export const closeDatalogsWatcher = async () => {
  if (datalogsWatcher) {
    try {
      logger.debug('Closing datalogsWatcher...')
      await datalogsWatcher.close()
      logger.debug('datalogsWatcher closed successfully.')
    } catch (error) {
      logger.error('Error closing datalogsWatcher:', error)
    } finally {
      datalogsWatcher = null
      datalogs().clear()
    }
  } else {
    logger.debug('datalogsWatcher is already closed or was never initialized.')
  }
}

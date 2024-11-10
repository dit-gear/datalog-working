import chokidar, { FSWatcher } from 'chokidar'
import { getActiveProjectPath, getRootPath } from '../state'
import logger from '../../logger'
import { loadProjectsInRootPath } from '../../project/loader'
import { updateProjectNameFromFolderRename } from '../../project/updater'
import { deleteActiveProject } from '../../project/delete'

export const initRootWatcher = async () => {
  let debounceTimeout: NodeJS.Timeout | null = null
  const addedDirs: Set<string> = new Set()
  const removedDirs: Set<string> = new Set()
  const renamedDirs: Set<{ oldPath: string; newPath: string }> = new Set()
  let pendingUnlink: string | null = null

  const rootWatcher = chokidar.watch(getRootPath(), {
    ignoreInitial: true,
    depth: 0,
    awaitWriteFinish: true
  })

  await new Promise((resolve) => {
    rootWatcher.on('ready', () => {
      logger.debug('rootWatcher ready')
      resolve(true)
    })
  })

  rootWatcher.on('addDir', (dirPath) => {
    logger.debug(`addDir event detected for: ${dirPath}`)

    // If there's a pending unlink, treat it as a rename
    if (pendingUnlink) {
      console.log(`Rename detected: ${pendingUnlink} -> ${dirPath}`)
      renamedDirs.add({ oldPath: pendingUnlink, newPath: dirPath })
      pendingUnlink = null // Clear the pending unlink after rename
    } else {
      addedDirs.add(dirPath) // Treat as a new addition
    }
    resetDebounce()
  })

  // Handle `unlinkDir` events
  rootWatcher.on('unlinkDir', (dirPath) => {
    logger.debug(`unlinkDir event detected for: ${dirPath}`)
    pendingUnlink = dirPath // Store the unlinked path temporarily
    setTimeout(() => {
      if (pendingUnlink === dirPath) {
        removedDirs.add(dirPath) // Confirm as removed if not followed by an `addDir`
        pendingUnlink = null
      }
    }, 500) // Check for renames within 500ms

    resetDebounce()
  })

  function resetDebounce() {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(processDirectoryChanges, 100)
  }

  async function processDirectoryChanges() {
    logger.debug('Processing directory changes')
    //console.table(Array.of(addedDirs))
    //console.table(Array.of(removedDirs))
    //console.table(Array.of(renamedDirs))
    //console.table(Array.of(pendingUnlink))
    const activeProjectPath = getActiveProjectPath()

    if (activeProjectPath && pendingUnlink === activeProjectPath) {
      console.log(`Active project path deleted: ${activeProjectPath}`)
      await deleteActiveProject()
    }

    const renamedProject = [...renamedDirs].find((entry) => entry.oldPath === activeProjectPath)
    if (renamedProject) {
      console.log('Renamed active project detected')
      await updateProjectNameFromFolderRename(renamedProject.newPath)
    }

    await loadProjectsInRootPath()

    // Clear tracked changes after processing
    addedDirs.clear()
    removedDirs.clear()
    renamedDirs.clear()
  }

  process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down...')
    await closeRootWatcher(rootWatcher)
    process.exit()
  })

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down...')
    await closeRootWatcher(rootWatcher)
    process.exit()
  })

  process.on('beforeExit', async () => {
    console.log('Application is exiting. Cleaning up resources...')
    await closeRootWatcher(rootWatcher)
  })
}

async function closeRootWatcher(watcher: FSWatcher) {
  if (watcher) {
    console.log('Closing root watcher...')
    await watcher.close()
    console.log('Root watcher closed.')
  }
}
/*
const initWatchers = (projectPath: string, appPath: string) => {
  let quitHandlerRegistered = false

  const projectWatcher = chokidar.watch(projectPath, { ignoreInitial: true, depth: 0 })
  const settingsWatcher = chokidar.watch(`${projectPath}/settings.yaml`, { ignoreInitial: true })

  const datalogsWatcher = chokidar.watch(`${projectPath}/*.datalog`, { ignoreInitial: true })

  settingsWatcher.on('change', () => {
    loadProject(getActiveProjectPath())
  })

  const closeWatchers = () => {
    settingsWatcher.close()
    datalogsWatcher.close()
    logger.debug('Watchers closed')
  }
  if (!quitHandlerRegistered) {
    app.on('before-quit', closeWatchers)
    quitHandlerRegistered = true
  }
}

const initTemplateWatcher = () => {
  const projectPath = getActiveProjectPath()
  const appPath = getAppPath()
  if (projectPath) {
    const directories = [
      `${projectPath}/templates/email`,
      `${projectPath}/templates/pdf`,
      `${appPath}/templates/email`,
      `${appPath}/templates/pdf`
    ]

    // Ensure directories exist
    directories.forEach((dir) => ensureDirectoryExists(dir))

    const templatesWatcher = chokidar.watch(*/
//directories.map((dir) => `${dir}/**/*.{jsx,tsx}`),
/*{ ignoreInitial: true }
    )
    templatesWatcher.on('ready', () => logger.debug('TemplateWatcher has started and is ready'))
    templatesWatcher.on('error', (error) => logger.error('TemplateWatcher error:', error))
    templatesWatcher.on('add', (filePath) => updateTemplatesDir(filePath, 'add'))
    templatesWatcher.on('unlink', (filePath) => updateTemplatesDir(filePath, 'remove'))
  } else {
    logger.debug('No active project to watch for TemplateWatcher')
  }
}

function updateTemplatesDir(filePath: string, action: 'add' | 'remove') {
  const activeProject = getActiveProject()
  if (!activeProject) return

  const { templatesDir } = activeProject

  if (action === 'add') {
    // Determine file type and scope based on file path
    const type = filePath.includes('/email') ? 'email' : 'pdf'
    const scope = filePath.includes('/project') ? 'project' : 'global'

    // Add the new file entry to templatesDir
    const newTemplate: TemplateDirectoryFile = { path: filePath, type, scope }
    activeProject.templatesDir = [...templatesDir, newTemplate]
  } else if (action === 'remove') {
    // Remove the file entry from templatesDir
    activeProject.templatesDir = templatesDir.filter((template) => template.path !== filePath)
  }
  // Update active project with modified templatesDir
  setActiveProject(activeProject)
}*/

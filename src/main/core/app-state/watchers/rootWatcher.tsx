import chokidar, { FSWatcher } from 'chokidar'
import { appState } from '../state'
import logger from '../../logger'
import { loadProjectsInRootPath } from '../../project/loader'
import { updateProjectNameFromFolderRename } from '../../project/updater'
import { forceUnloadActiveproject } from '../../project/unload'

let rootWatcher: FSWatcher | null = null

export const initRootWatcher = async () => {
  let debounceTimeout: NodeJS.Timeout | null = null
  const addedDirs: Set<string> = new Set()
  const removedDirs: Set<string> = new Set()
  const renamedDirs: Set<{ oldPath: string; newPath: string }> = new Set()
  let pendingUnlink: string | null = null

  rootWatcher = chokidar.watch(appState.rootPath, {
    ignoreInitial: true,
    depth: 0,
    awaitWriteFinish: true
  })

  await new Promise((resolve) => {
    rootWatcher?.on('ready', () => {
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
    const activeProjectPath = appState.activeProjectPath

    if (activeProjectPath && pendingUnlink === activeProjectPath) {
      logger.debug(`Active project path deleted: ${activeProjectPath}`)
      await forceUnloadActiveproject()
    }

    const renamedProject = [...renamedDirs].find((entry) => entry.oldPath === activeProjectPath)
    if (renamedProject) {
      logger.debug('Renamed active project detected')
      await updateProjectNameFromFolderRename(renamedProject.newPath)
    }

    await loadProjectsInRootPath()

    // Clear tracked changes after processing
    addedDirs.clear()
    removedDirs.clear()
    renamedDirs.clear()
  }
}

export const closeRootWatcher = async () => {
  if (rootWatcher) {
    try {
      logger.debug('Closing root watcher...')
      await rootWatcher.close()
      logger.debug('Root watcher closed.')
    } catch (error) {
      logger.error('Failed to close rootWatcher:', error)
    } finally {
      rootWatcher = null
    }
  } else {
    logger.debug('rootWatcher is already closed or was never initialized.')
  }
}

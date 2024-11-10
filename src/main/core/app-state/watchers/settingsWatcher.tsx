import chokidar, { FSWatcher } from 'chokidar'
import { getActiveProjectPath } from '../state'
import { updateProjectFromFile } from '../../project/updater'
import { deleteActiveProject } from '../../project/delete'

const initSettingsWatcher = async () => {
  const projectPath = getActiveProjectPath()
  const settingsWatcher = chokidar.watch(`${projectPath}/settings.yaml`, { ignoreInitial: true })

  settingsWatcher.on('change', () => {
    updateProjectFromFile()
  })

  settingsWatcher.on('unlink', () => {
    deleteActiveProject()
  })

  process.on('SIGINT', async () => {
    await closeSettingsWatcher(settingsWatcher)
    process.exit()
  })

  process.on('SIGTERM', async () => {
    await closeSettingsWatcher(settingsWatcher)
    process.exit()
  })

  process.on('beforeExit', async () => {
    await closeSettingsWatcher(settingsWatcher)
  })
}

async function closeSettingsWatcher(watcher: FSWatcher) {
  if (watcher) {
    console.log('Closing root watcher...')
    await watcher.close()
    console.log('Root watcher closed.')
  }
}

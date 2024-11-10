import { BrowserWindow } from 'electron'
import fs from 'fs'
import { join } from 'path'
import { InitialDir } from '../../shared/shared-types'
import { TemplateDirectoryFile } from '@shared/projectTypes'

function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function getDirectories(projectPath: string, appPath: string): TemplateDirectoryFile[] {
  return [
    { path: join(projectPath, 'templates/email'), type: 'email', scope: 'project' },
    { path: join(projectPath, 'templates/pdf'), type: 'pdf', scope: 'project' },
    { path: join(appPath, 'templates/email'), type: 'email', scope: 'global' },
    { path: join(appPath, 'templates/pdf'), type: 'pdf', scope: 'global' }
  ]
}

function loadDirectory(
  dirPath: string,
  type: 'email' | 'pdf',
  scope: 'project' | 'global'
): TemplateDirectoryFile[] {
  try {
    const files = fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith('.jsx') || file.endsWith('.tsx'))
      .map((file) => ({
        path: join(dirPath, file),
        type,
        scope
      }))
    console.log(`Loaded files from ${dirPath}:`, files)
    return files
  } catch (error) {
    console.error(`Failed to read directory ${dirPath}:`, error)
    return []
  }
}

function loadAllDirectories(projectPath: string, appPath: string): TemplateDirectoryFile[] {
  const directories = getDirectories(projectPath, appPath)
  directories.forEach((dir) => ensureDirectoryExists(dir.path))
  return directories.flatMap((dir) =>
    loadDirectory(dir.path, dir.type as 'email' | 'pdf', dir.scope as 'project' | 'global')
  )
}

export function sendInitialDirectories(projectPath: string, appPath: string): InitialDir {
  const allFiles = loadAllDirectories(projectPath, appPath)
  const path = { project: projectPath, global: appPath }
  return { dir: allFiles, path: path }
}

export function watchDirectories(
  editorWindow: BrowserWindow,
  projectPath: string,
  appPath: string
): void {
  const directories = getDirectories(projectPath, appPath)
  directories.forEach((dir) => ensureDirectoryExists(dir.path))
  directories.forEach((dir) => {
    fs.watch(dir.path, (eventType, filename) => {
      if (filename && (filename.endsWith('.jsx') || filename.endsWith('.tsx'))) {
        const allFiles = loadAllDirectories(projectPath, appPath)
        console.log('Directory changed, sending updated data:', allFiles)
        editorWindow.webContents.send('directory-changed', allFiles)
      }
    })
  })
}

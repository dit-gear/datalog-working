import { useState, useEffect } from 'react'
import { Path } from '@shared/shared-types'
import { TemplateDirectoryFile } from '@shared/projectTypes'

const useInitialDir = () => {
  const [dir, setDir] = useState<TemplateDirectoryFile[]>([])
  const [path, setPath] = useState<Path>({ project: '', global: '' } as Path)
  const [loading, setLoading] = useState(true)

  const handleDirectoryChanged = (_, files: TemplateDirectoryFile[]): void => {
    console.log('Received directory-changed:', JSON.stringify(files))
    setDir(files)
  }

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        const data = await window.editorApi.fetchInitialData()
        const { rootPath, projectPath, activeProject, loadedDatalogs } = data
        const templates = activeProject.templatesDir
        setDir(templates)
        setPath({ project: projectPath, global: rootPath })
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      } finally {
        setLoading(false)
        window.editorApi.showWindow()
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    window.editorApi.onDirChanged(handleDirectoryChanged)
  }, [])

  return { dir, path, loading }
}

export default useInitialDir

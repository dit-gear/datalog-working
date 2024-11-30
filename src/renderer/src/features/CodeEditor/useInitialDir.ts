import { useState, useEffect } from 'react'
import { Path } from '@shared/shared-types'
import { ProjectRootType, TemplateDirectoryFile } from '@shared/projectTypes'
import { DatalogType } from '@shared/datalogTypes'

const useInitialDir = () => {
  const [dir, setDir] = useState<TemplateDirectoryFile[]>([])
  const [path, setPath] = useState<Path>({ project: '', global: '' } as Path)
  const [data, setData] = useState<{ project: ProjectRootType; datalogs: DatalogType[] } | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  const handleDirectoryChanged = (_, files: TemplateDirectoryFile[]): void => {
    console.log('Received directory-changed:', JSON.stringify(files))
    setDir(files)
  }

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        const result = await window.editorApi.fetchInitialData()
        const { rootPath, projectPath, activeProject, loadedDatalogs } = result
        const templates = activeProject.templatesDir
        setDir(templates)
        setPath({ project: projectPath, global: rootPath })
        if (!data) setData({ project: activeProject, datalogs: loadedDatalogs })
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

  return { dir, path, loading, data }
}

export default useInitialDir

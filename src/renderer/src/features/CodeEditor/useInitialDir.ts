import { useState, useEffect } from 'react'
import { Path } from '@shared/shared-types'
import { TemplateDirectoryFile } from '@shared/projectTypes'

const useInitialDir = () => {
  const [dir, setDir] = useState<TemplateDirectoryFile[]>([])
  const [path, setPath] = useState<Path>({ project: '', global: '' } as Path)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        const data = await window.editorApi.getInitialDir()
        const { dir, path } = data
        setDir(dir)
        setPath(path)
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()

    const handleDirectoryChanged = (
      _event: Electron.IpcRendererEvent,
      files: TemplateDirectoryFile[]
    ): void => {
      //console.log('Received directory-changed:', files)
      setDir(files)
    }

    window.editorApi.onDirChanged(handleDirectoryChanged)

    // Cleanup listeners on unmount
    return (): void => {
      window.editorApi.removeAllListeners('directory-changed')
    }
  }, [])

  return { dir, path, loading }
}

export default useInitialDir

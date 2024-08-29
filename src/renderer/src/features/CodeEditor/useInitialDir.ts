import { useState, useEffect } from 'react'
import { DirectoryFile, Path } from '@shared/shared-types'

const useInitialDir = () => {
  const [dir, setDir] = useState<DirectoryFile[]>([])
  const [path, setPath] = useState<Path>({ project: '', global: '' } as Path)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      try {
        const data = await window.api.getInitialDir()
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
      files: DirectoryFile[]
    ): void => {
      //console.log('Received directory-changed:', files)
      setDir(files)
    }

    window.api.onDirChanged(handleDirectoryChanged)

    // Cleanup listeners on unmount
    return (): void => {
      window.api.removeAllListeners('directory-changed')
    }
  }, [])

  return { dir, path, loading }
}

export default useInitialDir

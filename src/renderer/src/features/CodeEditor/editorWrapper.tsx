import { useEffect } from 'react'
import Editor from './editor'
import { LoadedFile } from '@shared/shared-types'
import { handleApiResponse } from '@renderer/utils/handleApiResponse'
import { useLoadedFile } from './loadedFileContext'
import useInitialDir from './useInitialDir'

const Loader = () => <div>Loading...</div>

const EditorWrapper = () => {
  const { loadedFile, setLoadedFile } = useLoadedFile()
  const { data } = useInitialDir()

  useEffect(() => {
    window.editorApi.onResponseReadFile((response) => {
      handleApiResponse(response, (loadedFile: LoadedFile) => {
        setLoadedFile(loadedFile)
      })
    })
  }, [])

  if (!loadedFile) {
    return <Loader />
  }

  return <Editor loadedFile={loadedFile} data={data} />
}

export default EditorWrapper

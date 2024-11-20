import { useEffect } from 'react'
import Editor from './editor'
import { LoadedFile } from '@shared/shared-types'
import { handleApiResponse } from '@renderer/utils/handleApiResponse'
import { useLoadedFile } from './loadedFileContext'

const Loader = () => <div>Loading...</div>

const EditorWrapper = () => {
  const { loadedFile, setLoadedFile } = useLoadedFile()

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

  return <Editor loadedFile={loadedFile} />
}

export default EditorWrapper

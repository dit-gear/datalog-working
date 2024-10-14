import Aside from './aside'
import EditorWrapper from './editorWrapper'
import { LoadedFileProvider } from './loadedFileContext'

const Editorlayout = (): JSX.Element => {
  return (
    <div className="h-dvh border-t">
      <div className="flex h-full flex-row gap-2">
        <LoadedFileProvider>
          <Aside />
          <EditorWrapper />
        </LoadedFileProvider>
      </div>
    </div>
  )
}

export default Editorlayout

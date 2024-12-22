import { useState, useRef } from 'react'
import Editor, { EditorHandle } from './editor'
import { useLoadedFile } from './loadedFileContext'
import { FileQuestion } from 'lucide-react'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@components/ui/resizable'
import { Button } from '@components/ui/button'
import { DatabaseIcon, SearchCodeIcon, SettingsIcon, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import Preview from './preview'

const EditorWrapper = () => {
  const { loadedFiles } = useLoadedFile()

  const [activePath, setActivePath] = useState<string | null>(null)

  // A ref to call imperatively: editorRef.current.openFile(file)
  const editorRef = useRef<EditorHandle | null>(null)

  if (loadedFiles.length === 0) {
    return (
      <div className="border-l -mt-[36px] w-full flex flex-col gap-2 justify-center items-center">
        <FileQuestion size={32} />
        <span>No loaded file</span>
      </div>
    )
  }

  const selectedFile =
    activePath !== null ? loadedFiles.find((f) => f.path === activePath) : loadedFiles[0]

  // If user has never clicked a tab, choose the first file by default
  const handleTabClick = (filePath: string) => {
    setActivePath(filePath)
    const file = loadedFiles.find((f) => f.path === filePath)
    if (file && editorRef.current) {
      // This triggers monaco to load that file's model
      editorRef.current.openFile(file)
    }
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[100vh] w-full -mt-[36px] border-l"
    >
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex border-b px-2 py-1 gap-2">
            {loadedFiles.map((file) => {
              const isActive = file.path === (selectedFile?.path ?? '')
              return (
                <button
                  key={file.path}
                  onClick={() => handleTabClick(file.path)}
                  className={`px-3 py-1 rounded-t ${
                    isActive ? 'bg-gray-800 text-white' : 'bg-gray-200'
                  }`}
                >
                  {file.name}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="rounded">
              <DatabaseIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="rounded"
              onClick={() => editorRef.current?.openFind()}
            >
              <SearchCodeIcon className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="rounded">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/*<DropdownMenuCheckboxItem
                  checked={isFormatOnSave}
                  onCheckedChange={setIsFormatOnSave}
                >
                  Format on Save
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={autoCloseTags}
                  onCheckedChange={setAutoCloseTags}
                >
                  Autoclosing tags
                </DropdownMenuCheckboxItem>*/}
              </DropdownMenuContent>
            </DropdownMenu>
            {/*<Button variant="secondary" size="sm" className="rounded" onClick={handleSave}>
              <span>Save</span>
              <span className="ml-2 text-[10px] text-muted-foreground">(CMD + S)</span>
            </Button>*/}
          </div>
        </div>
        <Editor ref={editorRef} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Preview</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="rounded">
              Docs
            </Button>
          </div>
        </div>
        {/*<Preview />*/}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default EditorWrapper

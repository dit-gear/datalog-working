import { useState, useRef, useEffect, useCallback } from 'react'
import Editor, { EditorHandle } from './editor'
import { FileQuestion } from 'lucide-react'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@components/ui/resizable'
import { Button } from '@components/ui/button'
import { DatabaseIcon, SearchCodeIcon, SettingsIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@components/ui/dropdown-menu'
import Preview from '../../components/Preview'
import { CustomTab } from '@components/CustomTab'
import { LoadedFile } from '@shared/shared-types'
import { handleApiResponse } from '@renderer/utils/handleApiResponse'
import { NewMockdataDialog } from './newMockdataDialog'

const EditorWrapper = () => {
  const [isLoading, setLoading] = useState<boolean>(true)
  const [loadedFiles, setLoadedFiles] = useState<LoadedFile[]>([])
  const [pendingFile, setPendingFile] = useState<string | null>(null)

  const [activePath, setActivePath] = useState<string | null>(null)
  const [dirtyPaths, setDirtyPaths] = useState<string[]>([])

  const [formatOnSave, setFormatOnSave] = useState<boolean>(true)
  const [autoCloseTags, setAutoCloseTags] = useState<boolean>(true)

  // A ref to call imperatively: editorRef.current.openFile(file)
  const editorRef = useRef<EditorHandle | null>(null)

  const handleDirty = useCallback((path: string, isDirty: boolean) => {
    setDirtyPaths((prev) => {
      if (isDirty) {
        // Mark it dirty if not already
        if (!prev.includes(path)) return [...prev, path]
        return prev
      } else {
        // Remove from dirtyPaths if it’s currently in there
        return prev.filter((p) => p !== path)
      }
    })
  }, [])

  const resetDirty = useCallback(() => setDirtyPaths([]), [])

  const handleTabClick = (filePath: string) => {
    if (editorRef.current) {
      setActivePath(filePath)
      const file = loadedFiles.find((f) => f.path === filePath)
      if (file) editorRef.current.openFile(file)
    } else {
      setLoading(true)
      setPendingFile(filePath)
    }
  }

  const handleCloseTab = (file: LoadedFile) => {
    const remainingFiles = loadedFiles.filter((f) => f.path !== file.path)
    setLoadedFiles(remainingFiles)
    if (dirtyPaths.includes(file.path)) {
      setDirtyPaths(dirtyPaths.filter((path) => path !== file.path))
    }
    const nextFile = remainingFiles[0]
    if (nextFile) {
      setActivePath(nextFile.path)
      editorRef.current?.openFile(nextFile)
    } else {
      setActivePath(null)
      setLoading(true)
    }
    editorRef.current?.removeFile(file)
  }

  useEffect(() => {
    window.editorApi.onResponseReadFile((response) => {
      handleApiResponse(response, (newFile: LoadedFile) => {
        setLoadedFiles((prev) => {
          // If not found, add it:
          const existingIndex = prev.findIndex((f) => f.path === newFile.path)
          if (existingIndex >= 0) return prev
          return [...prev, newFile]
        })
        // Then immediately:
        setPendingFile(newFile.path)
      })
    })
  }, [])

  useEffect(() => {
    if (!pendingFile || isLoading) return
    const file = loadedFiles.find((f) => f.path === pendingFile)
    if (!file) return
    editorRef?.current?.openFile(file)
    setActivePath(pendingFile)
    setPendingFile(null)
  }, [pendingFile, isLoading, loadedFiles])

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

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[100vh] w-full -mt-8 border-l">
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div
          className="flex items-center justify-between "
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="flex px-2 gap-2 border-b-2">
            {loadedFiles.map((file) => {
              const isActive = file.path === (selectedFile?.path ?? '')
              const isDirty = dirtyPaths.includes(file.path)
              return (
                <CustomTab
                  key={file.path}
                  variant="secondary"
                  isDirty={isDirty}
                  isActive={isActive}
                  size="sm"
                  onClick={() => handleTabClick(file.path)}
                  {...(isActive && { action: { onClick: () => handleCloseTab(file) } })}
                >
                  <span className="text-xs">{file.name}</span>
                </CustomTab>
              )
            })}
          </div>

          <div className="flex gap-2">
            <NewMockdataDialog>
              <Button size="sm" variant="secondary" className="rounded">
                <DatabaseIcon className="h-4 w-4" />
              </Button>
            </NewMockdataDialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="rounded">
                  <SettingsIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={formatOnSave} onCheckedChange={setFormatOnSave}>
                  Format on Save
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={autoCloseTags}
                  onCheckedChange={setAutoCloseTags}
                >
                  Autoclosing tags
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Editor
          ref={editorRef}
          onDirty={handleDirty}
          resetDirty={resetDirty}
          onEditorReady={() => setLoading(false)}
          options={[formatOnSave, autoCloseTags]}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="rounded text-xs">
              Docs
            </Button>
          </div>
        </div>
        <Preview />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default EditorWrapper

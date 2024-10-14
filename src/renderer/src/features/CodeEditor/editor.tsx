import { useState, useEffect, useRef } from 'react'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@components/ui/resizable'
import { Button } from '@components/ui/button'
import { SearchCodeIcon, SettingsIcon } from 'lucide-react'
import * as monaco from 'monaco-editor'
import { Editor as MonacoEditor, loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { createHighlighter } from 'shiki'
import { shikiToMonaco } from '@shikijs/monaco'
import { formatter } from '@renderer/utils/prettierFormatter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@components/ui/dropdown-menu'
import { LoadedFile } from '@shared/shared-types'

type Monaco = typeof monaco

const highlighter = await createHighlighter({
  themes: ['dark-plus', 'vitesse-dark', 'vitesse-light'],
  langs: ['jsx', 'tsx']
})

interface EditorProps {
  loadedFile: LoadedFile
}

const Editor = ({ loadedFile }: EditorProps) => {
  // const [loadedFile, setLoadedFile] = useState<LoadedFile | null>(null)
  const [editorContent, setEditorContent] = useState<string>(loadedFile.content)
  const [previewContent, setPreviewContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const previewWorkerRef = useRef<Worker | null>(null)
  const linterWorkerRef = useRef<Worker | null>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isFormatOnSave, setIsFormatOnSave] = useState<boolean>(true)
  const [autoCloseTags, setAutoCloseTags] = useState<boolean>(true)

  useEffect(() => {
    setEditorContent(loadedFile.content)
  }, [loadedFile])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault() // Prevent the default save action
        handleSave() // Call your save function
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const previewWorker = new Worker(new URL('@workers/preview-worker.ts', import.meta.url), {
      type: 'module'
    })
    previewWorkerRef.current = previewWorker

    const linterWorker = new Worker(new URL('@workers/linter-worker.ts', import.meta.url), {
      type: 'module'
    })
    linterWorkerRef.current = linterWorker

    previewWorker.onmessage = (e): void => {
      const { html, error } = e.data
      if (error) {
        console.error(error)
        setError(error)
      } else {
        setError(null)
        setPreviewContent(html)
      }
    }

    linterWorker.onmessage = (e): void => {
      const { lintMessages, error } = e.data
      if (error) {
        console.error('Linting Error:', error)
      } else {
        const markers = lintMessages.map((result) => ({
          startLineNumber: result.line,
          startColumn: result.column,
          endLineNumber: result.endLine || result.line,
          endColumn: result.endColumn || result.column,
          message: result.message,
          severity: monaco.MarkerSeverity.Error
        })) as monaco.editor.IMarkerData[]

        if (editorRef.current) {
          const model = editorRef.current.getModel()
          if (model) {
            monaco.editor.setModelMarkers(model, 'eslint', markers)
          }
        }
      }
    }

    if (editorContent) {
      const request = {
        code: editorContent,
        type: loadedFile.type
      }
      previewWorker.postMessage(request)
      linterWorker.postMessage(editorContent)
    }

    // Clean up the worker when the component unmounts
    return () => {
      previewWorker.terminate()
      linterWorker.terminate()
    }
  }, [])

  useEffect(() => {
    if (editorContent && previewWorkerRef.current && linterWorkerRef.current) {
      const request = {
        code: editorContent,
        type: loadedFile.type
      }
      previewWorkerRef.current.postMessage(request)
      linterWorkerRef.current.postMessage(editorContent)
    }
  }, [editorContent])

  const sendMessageToWorker = (): void => {
    // console.log('editorcontent:', editorContent)
    if (!previewWorkerRef.current || !linterWorkerRef.current) {
      console.error('Workers not initialized')
      return
    }
    const request = {
      code: editorContent,
      type: loadedFile.type
    }
    previewWorkerRef.current.postMessage(request)
    linterWorkerRef.current.postMessage(editorContent)
  }

  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }
  monaco.languages.register({ id: 'jsx' })
  monaco.languages.register({ id: 'tsx' })

  function insertClosingTag(): void {
    if (!editorRef.current) return
    const model = editorRef.current.getModel()
    const position = editorRef.current.getPosition()
    if (!model || !position) return

    const textUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })

    // Regex to match the opening tag
    const match = textUntilPosition.match(/<(\w+)([^>]*)>?$/)
    if (match && !/\/\s*$/.test(match[2])) {
      const tag = match[1]
      const closingTag = `</${tag}>`

      editorRef.current.executeEdits('', [
        {
          range: new monaco.Range(
            position.lineNumber,
            position.column + 1,
            position.lineNumber,
            position.column + 1
          ),
          text: closingTag,
          forceMoveMarkers: true
        }
      ])

      // Move cursor inside the newly added closing tag
      editorRef.current.setPosition({
        lineNumber: position.lineNumber,
        column: position.column
      })
    }
  }

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ): void => {
    editorRef.current = editor
    sendMessageToWorker()
    shikiToMonaco(highlighter, monacoInstance)
  }
  loader.config({ monaco })

  function handleEditorChange(value: string | undefined): void {
    const newValue = value || ''
    setEditorContent(newValue)
    if (editorRef.current && autoCloseTags) {
      editorRef.current.onDidChangeModelContent((event) => {
        const changes = event.changes
        if (changes.length === 0) return

        const change = changes[0]
        const text = change.text

        // Check if the user typed a ">"
        if (text === '>') {
          insertClosingTag()
        }
      })
    }
    // Post message to worker with the new content
    if (previewWorkerRef.current && linterWorkerRef.current) {
      previewWorkerRef.current.postMessage(newValue)
      linterWorkerRef.current.postMessage(newValue)
    }
  }
  async function formatCode(): Promise<void> {
    const formattedCode = await formatter(editorContent)
    setEditorContent(formattedCode)
    if (previewWorkerRef.current && linterWorkerRef.current) {
      previewWorkerRef.current.postMessage(formattedCode)
      linterWorkerRef.current.postMessage(formattedCode)
    }
  }

  const handleSave = async (): Promise<void> => {
    let codeToSave = editorContent
    if (isFormatOnSave) {
      codeToSave = await formatter(editorContent)
    }
    const response = await window.api.saveFile({ ...loadedFile, content: codeToSave })
    if (response.success) {
      console.log('File saved successfully')
    } else {
      console.error('Error saving file:', response.error)
    }
    setEditorContent(codeToSave)
    if (previewWorkerRef.current && linterWorkerRef.current) {
      previewWorkerRef.current.postMessage(codeToSave)
      linterWorkerRef.current.postMessage(codeToSave)
    }
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[200px] w-full border-x">
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Editor</span>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="p-3"
              onClick={() => editorRef.current?.getAction('actions.find')?.run()}
            >
              <SearchCodeIcon />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="p-3" variant="secondary">
                  <SettingsIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
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
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="secondary" onClick={handleSave}>
              <span>Save</span>
              <span className="ml-2 text-xs text-muted-foreground">(CMD + S)</span>
            </Button>
          </div>
        </div>
        <MonacoEditor
          height="100%"
          theme="dark-plus"
          language={loadedFile?.filetype}
          value={editorContent}
          onMount={handleEditorDidMount}
          onChange={(v) => handleEditorChange(v)}
          options={{
            autoClosingBrackets: 'always',
            scrollBeyondLastLine: false,
            formatOnType: true,
            formatOnPaste: true
          }}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="flex flex-col m-2 gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Preview</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">
              Sample Data
            </Button>
            <Button size="sm" variant="secondary">
              Docs
            </Button>
          </div>
        </div>
        <div className="h-full rounded-md bg-white text-black">
          {loadedFile && previewContent && !error && (
            <iframe
              id="iframe"
              className="w-full h-full"
              {...(loadedFile.type === 'pdf'
                ? { src: previewContent }
                : { srcDoc: previewContent })}
            />
          )}
          {error ? <div className="bg-red-100 p-8">{error}</div> : null}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default Editor
/*<iframe id="iframe" srcDoc={previewContent} className="w-full h-full" />*/

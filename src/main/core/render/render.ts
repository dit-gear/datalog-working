import { createContext, Script } from 'vm'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { transform } from 'sucrase'
import { DataObjectType } from '@shared/shared-types'

interface PreviewRequest {
  code: string // User-generated TSX/JSX code (transformed before execution)
  type: 'email' | 'pdf'
  dataObject: DataObjectType
}

export async function render({ code, type, dataObject }: PreviewRequest): Promise<any> {
  // Pre-import components and data
  let components: Record<string, unknown> = {}
  let pdf

  try {
    const { DataObject } = await import('@shared/utils/datalog-methods')
    // Depending on the type, select the allowed set of components
    if (type === 'email') {
      const {
        Html,
        Head,
        Body,
        Button,
        Container,
        CodeBlock,
        CodeInline,
        Column,
        Row,
        Font,
        Heading,
        Hr,
        Img,
        Link,
        Markdown,
        Section,
        Preview,
        Text
      } = await import('@react-email/components')

      components = {
        Html,
        Head,
        Body,
        Button,
        Container,
        CodeBlock,
        CodeInline,
        Column,
        Row,
        Font,
        Heading,
        Hr,
        Img,
        Link,
        Markdown,
        Section,
        Preview,
        Text
      }
    } else if (type === 'pdf') {
      const {
        Document,
        Page,
        View,
        Text,
        Link,
        Image,
        Font,
        StyleSheet,
        PDFViewer,
        pdf: importedpdf
      } = await import('@react-pdf/renderer')
      pdf = importedpdf

      components = {
        Document,
        Page,
        View,
        Text,
        Link,
        Image,
        Font,
        StyleSheet,
        PDFViewer
      }
    }

    // Create a data object instance
    const data = new DataObject(dataObject.project, dataObject.selection, dataObject.all)

    // Transform the code to plain JS before running in the VM
    // The user code might contain TS or JSX, so we must transpile it.
    const transpiledCode = transform(code, {
      transforms: ['typescript', 'jsx', 'imports'],
      // We keep dynamic imports from being fully resolved, but since we run in VM with no require, they won't work anyway.
      preserveDynamicImport: true
    }).code

    // We'll wrap the code so that it returns the default export component
    // We assume that after transpilation, `module.exports.default` will contain the component.
    const wrappedCode = `
    const module = { exports: {} };
    const exports = module.exports;
    ${transpiledCode}
    module.exports.default;
  `

    // Create a sandbox environment. It's important not to expose Node APIs.
    const sandbox: Record<string, unknown> = {
      // Provide the globals needed by the code
      React,
      ...components,
      data,
      // Provide a console if needed, or omit it entirely
      console: {
        log: (...args: unknown[]) => {
          // Restrict logging or pipe it to main process logs if desired
          // Or leave this empty to avoid logging from user code
        }
      }
      // No require, no process, no Node globals
    }

    // Create a context from the sandbox
    const context = createContext(sandbox, {
      name: 'secure-sandbox',
      origin: 'electron://backend', // Just a label
      codeGeneration: {
        strings: true,
        wasm: false
      }
    })

    // Create and run a script in the secure context
    const script = new Script(wrappedCode, { filename: 'UserComponent.js' })
    const Component = script.runInContext(context, {
      timeout: 1000 // execution timeout (in ms)
    })

    // `Component` should now be the user’s default exported React component
    if (!Component) {
      throw new Error('No component was exported by the user code')
    }

    if (type === 'email') {
      // For email, we render to an HTML string
      const renderedContent = ReactDOMServer.renderToString(React.createElement(Component))
      return { html: renderedContent }
    } else if (type === 'pdf') {
      // For PDF, we create a string representation of PDF document
      const pdfDocument = pdf(React.createElement(Component)).toString()
      return { html: pdfDocument }
    }
  } catch (error) {
    const err = error instanceof Error ? error.message : 'unknown'
    throw new Error(err)
  }
}
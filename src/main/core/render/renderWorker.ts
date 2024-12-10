import { parentPort } from 'worker_threads'
import { createContext, Script } from 'vm'
import React from 'react'
import { render } from '@react-email/render'
import { transform } from 'sucrase'
import { WorkerRequest } from './types'

parentPort?.on('message', async (event: WorkerRequest): Promise<void> => {
  const { code, type, dataObject, id } = event
  let components: Record<string, unknown> = {}
  let pdf

  try {
    const { DataObject } = await import('@shared/utils/datalog-methods')
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
    const data = new DataObject(dataObject.project, dataObject.selection, dataObject.all)

    const transpiledCode = transform(code, {
      transforms: ['typescript', 'jsx', 'imports'],
      preserveDynamicImport: true
    }).code

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
      const renderedContent = await render(React.createElement(Component), { plainText: false })
      parentPort?.postMessage({ id, html: renderedContent })
    } else if (type === 'pdf') {
      // For PDF, we create a string representation of PDF document
      const pdfDocument = pdf(React.createElement(Component)).toBuffer()
      parentPort?.postMessage({ id, html: pdfDocument.toString('base64') })
    }
  } catch (error) {
    console.error('Error in render-worker', error)
    parentPort?.postMessage({ id, error: (error as Error).message })
  }
})

import { parentPort } from 'worker_threads'
import { createContext, Script } from 'vm'
import React from 'react'
import {
  pdf as _pdf,
  renderToBuffer as _renderToBuffer,
  Document as PdfDocument,
  Page as PdfPage,
  View as PdfView,
  Text as PdfText,
  Link as PdfLink,
  Image as PdfImage,
  Font as PdfFont,
  StyleSheet as PdfStyleSheet
} from '@react-pdf/renderer'
//import { render } from '@react-email/render'
import { render as emailRender } from '@react-email/render'
import {
  Html,
  Head,
  Body,
  Button,
  Container,
  CodeBlock,
  CodeInline,
  Column,
  Row,
  Font as EmailFont,
  Heading,
  Hr,
  Img,
  Link as EmailLink,
  Markdown,
  Section,
  Preview,
  Text as EmailText
} from '@react-email/components'
import { transform } from 'sucrase'
import { WorkerRequest } from './types'
import { inlineAssetImports } from '@shared/utils/inlineAssetsImports'
import { removeImports } from '@shared/utils/removeImports'
import { insertPoweredBy } from '@shared/utils/addPoweredBy'

parentPort?.on('message', async (event: WorkerRequest): Promise<void> => {
  const { id, path, code, type, dataObject } = event
  let components: Record<string, unknown> = {}
  let pdf
  let render

  try {
    // Import shared data class.
    const { DataObject } = await import('@shared/datalogClass')

    if (type === 'email') {
      // Use statically imported react-email modules.
      render = emailRender
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
        Font: EmailFont,
        Heading,
        Hr,
        Img,
        Link: EmailLink,
        Markdown,
        Section,
        Preview,
        Text: EmailText
      }
    } else if (type === 'pdf') {
      // Use statically imported react-pdf modules.
      pdf = _pdf
      render = _renderToBuffer
      components = {
        Document: PdfDocument,
        Page: PdfPage,
        View: PdfView,
        Text: PdfText,
        Link: PdfLink,
        Image: PdfImage,
        Font: PdfFont,
        StyleSheet: PdfStyleSheet
      }
    }

    // Create the data object.
    const data = new DataObject(dataObject)

    const { projectName, customInfo, message, datalog, datalogArray, datalogs, total } = data

    const codeWithAssets = await inlineAssetImports(type, path, code)
    const codeWithoutImports = await removeImports(codeWithAssets)
    const formatted = insertPoweredBy(codeWithoutImports, type)

    // Transpile user code.
    const transpiledCode = transform(formatted, {
      transforms: ['typescript', 'jsx', 'imports'],
      preserveDynamicImport: true
    }).code

    // Wrap the code to simulate a module environment.
    const wrappedCode = `
      const module = { exports: {} };
      const exports = module.exports;
      ${transpiledCode}
      module.exports.default;
    `

    // Construct the sandbox with injected modules and values.
    const sandbox: Record<string, unknown> = {
      React,
      ...components,
      projectName,
      customInfo,
      message,
      datalog,
      datalogArray,
      datalogs,
      total,
      // If PDF is needed, inject the preloaded pdf function.
      ...(pdf ? { pdf } : {}),
      // Provide a minimal console.
      console: { log: () => {} }
    }

    // Create a secure context.
    const context = createContext(sandbox, {
      name: 'secure-sandbox',
      origin: 'electron://backend',
      codeGeneration: { strings: true, wasm: false }
    })

    // Create and run the script in the secure sandbox.
    const script = new Script(wrappedCode, { filename: 'UserComponent.js' })
    const Component = script.runInContext(context, { timeout: 1000 })

    if (!Component) {
      throw new Error('No component was exported by the user code')
    }

    // Render output based on type.
    if (type === 'email') {
      const renderedContent = await render(React.createElement(Component), {
        plainText: false
      })
      const renderedContentPlainText = await render(React.createElement(Component), {
        plainText: true
      })
      parentPort?.postMessage({ id, code: renderedContent, plainText: renderedContentPlainText })
    } else if (type === 'pdf') {
      const pdfDocument = await render(React.createElement(Component))
      parentPort?.postMessage({ id, code: pdfDocument })
    }
  } catch (error) {
    console.error('Error in render-worker', error)
    parentPort?.postMessage({ id, error: (error as Error).message })
  }
})

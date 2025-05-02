import React from 'react'
import { transform } from 'sucrase'
import { pdf } from '@react-pdf/renderer'
import { render } from '@react-email/render'
import { DataObjectType } from '@shared/datalogClass'
import { inlineAssetImports } from '@shared/utils/inlineAssetsImports'
import { removeImports } from '../../../shared/utils/removeImports'
import { insertPoweredBy } from '../../../shared/utils/addPoweredBy'

interface PreviewWorkerRequest {
  path: string
  code: string
  type: 'email' | 'pdf'
  dataObject: DataObjectType
  id: number
}

self.onmessage = async (event: MessageEvent<PreviewWorkerRequest>): Promise<void> => {
  const { path, code, type, dataObject, id } = event.data
  let components: Record<string, unknown> = {}

  console.log(dataObject)

  try {
    const { DataObject } = await import('@shared/datalogClass')
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
      const { Document, Page, View, Text, Link, Image, Font, StyleSheet, PDFViewer } = await import(
        '@react-pdf/renderer'
      )

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
    const data = new DataObject(dataObject)

    const codeWithAssets = await inlineAssetImports(type, path, code)
    const codeWithoutImports = await removeImports(codeWithAssets)
    const formatted = insertPoweredBy(codeWithoutImports, type)

    const transpiledCode = transform(formatted, {
      transforms: ['typescript', 'jsx', 'imports'],
      preserveDynamicImport: true
    }).code

    const wrappedCode = `
      const module = { exports: {} };
      const exports = module.exports;
      ${transpiledCode}
      return module.exports.default;
    `

    const Component = new Function(
      'React',
      ...Object.keys(components),
      'projectName',
      'customInfo',
      'message',
      'datalog',
      'datalogArray',
      'datalogs',
      'total',
      'data',
      wrappedCode
    )(
      React,
      ...Object.values(components),
      data.projectName,
      data.customInfo,
      data.message,
      data.datalog,
      data.datalogArray,
      data.datalogs,
      data.total,
      data
    )

    if (type === 'email') {
      const renderedContent = await render(React.createElement(Component), { plainText: false })
      self.postMessage({ id, type, code: renderedContent })
    } else if (type === 'pdf') {
      // Create a PDF document using the component wrapped in PDFViewer
      const pdfDocument = pdf(React.createElement(Component))
      const pdfBlob = await pdfDocument.toBlob()

      // Create a URL for the Blob to be used in an iframe
      const pdfUrl = URL.createObjectURL(pdfBlob)
      self.postMessage({ id, type, code: pdfUrl })
    }
  } catch (error) {
    console.error('Error in preview-worker', error)
    self.postMessage({ id, error: (error as Error).message })
  }
}

import React from 'react'
import { transform } from 'sucrase'
import { pdf, usePDF } from '@react-pdf/renderer'
import { render } from './utils/render'
import { PreviewWorkerRequest } from './utils/types'
import { inlineAssetImports } from '@shared/utils/inlineAssetsImports'
import { removeImports } from '../../../shared/utils/removeImports'
import { insertPoweredBy } from '../../../shared/utils/addPoweredBy'

self.onmessage = async (event: MessageEvent<PreviewWorkerRequest>) => {
  const { code, type, dataObject, id } = event.data
  let components: Record<string, unknown> = {}

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

    const codeWithAssets = await inlineAssetImports(type, id, code)
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

    console.log('id:', id)

    if (type === 'email') {
      try {
        const renderEmail = await render(React.createElement(Component))
        if (renderEmail.success) {
          self.postMessage({
            msgtype: 'preview-update',
            success: true,
            id,
            type,
            code: renderEmail.html
          })
        } else {
          self.postMessage({
            msgtype: 'preview-update',
            success: false,
            id,
            error: renderEmail.error
          })
        }
      } catch (err) {
        console.error('Error rendering email preview', err)
        self.postMessage({
          msgtype: 'preview-update',
          success: false,
          id,
          error: (err as Error).message
        })
      }
    } else if (type === 'pdf') {
      try {
        const doc = pdf(React.createElement(Component))
        const blob = await doc.toBlob()
        const url = URL.createObjectURL(blob)

        self.postMessage({
          msgtype: 'preview-update',
          success: true,
          id,
          type,
          code: url
        })
      } catch (err) {
        console.error('Error rendering PDF preview', err)
        self.postMessage({
          msgtype: 'preview-update',
          success: false,
          id,
          error: (err as Error).message
        })
      }
    }
  } catch (error) {
    console.error('Error in preview-worker', error)
    self.postMessage({
      msgtype: 'preview-update',
      success: false,
      id,
      error: (error as Error).message
    })
  }
}

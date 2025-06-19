import React from 'react'
import { transform } from 'sucrase'
import { pdf, DocumentProps } from '@react-pdf/renderer'
import { render } from './utils/render'
import { PreviewWorkerRequest } from './utils/types'
import { inlineAssetImports } from '@shared/utils/inlineAssetsImports'
import { removeImports } from '../../../shared/utils/removeImports'
import { insertPoweredBy } from '../../../shared/utils/addPoweredBy'
import { createDaytalog, InternalDaytalogProvider } from 'daytalog'

self.onmessage = async (event: MessageEvent<PreviewWorkerRequest>) => {
  const { code, type, daytalogProps, id } = event.data
  let components: Record<string, unknown> = {}

  if (!daytalogProps) {
    return // Just wait for the next message
  }

  try {
    const dayta = await createDaytalog(daytalogProps)
    const { useDaytalog } = await import('daytalog')
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
      const { Document, Page, View, Text, Link, Image, Font, StyleSheet } = await import(
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
        StyleSheet
      }
    }

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

    const Component = new Function('React', ...Object.keys(components), 'useDaytalog', wrappedCode)(
      React,
      ...Object.values(components),
      useDaytalog
    )

    if (type === 'email') {
      try {
        const renderEmail = await render(
          React.createElement(InternalDaytalogProvider, {
            value: dayta,
            children: React.createElement(Component)
          })
        )
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
        const providerElement = React.createElement(InternalDaytalogProvider, {
          value: dayta,
          children: React.createElement(Component)
        })
        // Cast to satisfy pdf() DocumentProps requirement
        const doc = pdf(providerElement as unknown as React.ReactElement<DocumentProps>)
        //const doc = pdf(React.createElement(Component))
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

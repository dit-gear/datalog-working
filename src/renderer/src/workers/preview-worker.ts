import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { transform } from 'sucrase'
import { pdf } from '@react-pdf/renderer'

// `${transpiledCode}\nreturn Emailtest;`

interface PreviewWorkerRequest {
  code: string
  type: 'email' | 'pdf'
}

self.onmessage = async (event: MessageEvent<PreviewWorkerRequest>): Promise<void> => {
  const { code, type } = event.data
  let components: Record<string, unknown> = {}

  try {
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

    const data = {
      selected: {
        name: '240801_DAY01',
        day: 1,
        date: '2024-08-01'
      },
      target: {
        days: 3,
        size: 1233
      }
    }

    const transpiledCode = transform(code, {
      transforms: ['typescript', 'jsx', 'imports'],
      preserveDynamicImport: true
    }).code

    const wrappedCode = `
      const module = { exports: {} };
      const exports = module.exports;
      ${transpiledCode}
      return module.exports.default;
    `

    const Component = new Function('React', ...Object.keys(components), 'data', wrappedCode)(
      React,
      ...Object.values(components),
      data
    )

    let renderedContent

    if (type === 'email') {
      renderedContent = ReactDOMServer.renderToString(React.createElement(Component))
      self.postMessage({ html: renderedContent })
    } else if (type === 'pdf') {
      // Create a PDF document using the component wrapped in PDFViewer
      const pdfDocument = pdf(React.createElement(Component))
      const pdfBlob = await pdfDocument.toBlob()

      // Create a URL for the Blob to be used in an iframe
      const pdfUrl = URL.createObjectURL(pdfBlob)
      self.postMessage({ html: pdfUrl })
    }
  } catch (error) {
    console.error('Error in preview-worker', error)
    self.postMessage({ error: (error as Error).message })
  }
}

/*
USE THIS CODE IN MAIN PROCESS TO RENDER

const script = new vm.Script(event, {
      filename: 'EmailTest.jsx', // This is useful for stack traces
      displayErrors: true
    })
    const sandbox = {
      module: {},
      exports: {},
      require: require,
      React: React // Make React available in the script's scope
    }
    // Run the script in the new context
    script.runInNewContext(sandbox)

    // Now, sandbox.module.exports should be your React component
    const EmailTest = sandbox.module.exports

    const html = renderToString(React.createElement(EmailTest))
    */

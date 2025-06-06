import type { PipeableStream, ReactDOMServerReadableStream } from 'react-dom/server'

const decoder = new TextDecoder('utf-8')

const readStream = async (stream: PipeableStream | ReactDOMServerReadableStream) => {
  const chunks: Uint8Array[] = []

  if ('pipeTo' in stream) {
    // means it's a readable stream
    const writableStream = new WritableStream({
      write(chunk: Uint8Array) {
        chunks.push(chunk)
      }
    })
    await stream.pipeTo(writableStream)
  } else {
    throw new Error(
      'For some reason, the Node version of `react-dom/server` has been imported instead of the browser one.',
      {
        cause: {
          stream
        }
      }
    )
  }

  let length = 0
  chunks.forEach((item) => {
    length += item.length
  })
  const mergedChunks = new Uint8Array(length)
  let offset = 0
  chunks.forEach((item) => {
    mergedChunks.set(item, offset)
    offset += item.length
  })

  return decoder.decode(mergedChunks)
}

export const render = async (element: React.ReactElement) => {
  //const suspendedElement = <Suspense>{element}</Suspense>
  const reactDOMServer = await import('react-dom/server').then(
    // This is beacuse react-dom/server is CJS
    (m) => m.default
  )

  let html!: string
  try {
    if (Object.hasOwn(reactDOMServer, 'renderToReadableStream')) {
      console.log('render first')
      html = await readStream(await reactDOMServer.renderToReadableStream(element))
    } else {
      console.log('render else')
      await new Promise<void>((resolve, reject) => {
        const stream = reactDOMServer.renderToPipeableStream(element, {
          async onAllReady() {
            html = await readStream(stream)
            resolve()
          },
          onError(error) {
            reject(error as Error)
          }
        })
      })
    }
  } catch (error) {
    const message = error instanceof Error && error.message
    return { success: false, error: message }
  }

  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'

  const document = `${doctype}${html.replace(/<!DOCTYPE.*?>/, '')}`

  // If React’s streaming renderer injected an error-fallback <template>, extract its message
  const errorMatch = document.match(/<template[^>]*data-msg="([^"]*)"/)
  if (errorMatch) {
    return { success: false, error: errorMatch[1] }
  }

  return { success: true, html: document }
}

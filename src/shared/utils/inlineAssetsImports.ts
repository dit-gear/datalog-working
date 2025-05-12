// Cache mapping relative path → base64 string
const base64Cache: Record<string, string> = {}

// Simple counter for correlating requests
let __reqId = 0

async function fetchBase64Map(basePath: string, paths: string[]): Promise<Record<string, string>> {
  const base = basePath.substring(0, basePath.lastIndexOf('/') + 1)
  const isNode = typeof process !== 'undefined' && process.versions?.node != null
  if (isNode) {
    const path = require('path')
    const { readFile } = require('fs/promises')
    const result: Record<string, string> = {}
    for (const rel of paths) {
      const abs = path.resolve(base, rel)
      const buf = await readFile(abs)
      result[rel] = buf.toString('base64')
    }
    return result
  }
  // In a browser worker, delegate to renderer via postMessage
  const id = `read-files-${++__reqId}`
  return new Promise((resolve) => {
    function onMessage(e: MessageEvent) {
      const msg = e.data
      if (msg?.msgtype === 'read-files-base64-response' && msg.id === id) {
        self.removeEventListener('message', onMessage)
        resolve(msg.data as Record<string, string>)
      }
    }
    self.addEventListener('message', onMessage)
    self.postMessage({ msgtype: 'read-files-base64', id, base, paths })
  })
}

/**
 * Inlines all `import name from './assets/…';` by:
 * 1. Scanning the code
 * 2. Fetching only uncached assets via one batched request
 * 3. Caching their base64 results
 * 4. Rewriting each import into `const name = '<data URI>';`
 */
export async function inlineAssetImports(
  type: 'email' | 'pdf',
  path: string,
  code: string
): Promise<string> {
  if (type === 'email') return code
  const importRe = /import\s+(\w+)\s+from\s+['"](\.\/assets\/([^'"]+))['"];?/g
  type Imp = { varName: string; relPath: string; fileName: string }
  const imports: Imp[] = []
  let m: RegExpExecArray | null
  while ((m = importRe.exec(code))) {
    imports.push({ varName: m[1], relPath: m[2], fileName: m[3] })
  }
  if (imports.length === 0) return code

  // Figure out which paths aren’t in cache yet
  const allPaths = Array.from(new Set(imports.map((i) => i.relPath)))
  const uncached = allPaths.filter((p) => !(p in base64Cache))

  // Fetch new ones
  if (uncached.length > 0) {
    const newMap = await fetchBase64Map(path, uncached)
    Object.assign(base64Cache, newMap)
  }

  const getMime = (fn: string) => {
    const ext = fn.split('.').pop()!.toLowerCase()
    if (ext === 'svg') return 'image/svg+xml'
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
    return 'image/png'
  }

  // Replace imports using cached data
  let out = code
  for (const { varName, relPath, fileName } of imports) {
    const b64 = base64Cache[relPath]
    if (!b64) continue
    const dataUri = `data:${getMime(fileName)};base64,${b64}`
    const esc = relPath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const singleRe = new RegExp(`import\\s+${varName}\\s+from\\s+['"]${esc}['"];?`)
    out = out.replace(singleRe, `const ${varName} = '${dataUri}';`)
  }

  return out
}

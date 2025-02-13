import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import pkg from '../../../package.json'

export function setupAboutIpcHandlers(): void {
  ipcMain.handle('app-version', async (): Promise<string> => {
    interface LicenseEntry {
      package: string
      license: string
    }

    const dependencies = pkg.dependencies || {}
    const licenses: LicenseEntry[] = []
    const licenseFilenames = [
      'LICENSE',
      'LICENSE.txt',
      'LICENSE.md',
      'license',
      'license.txt',
      'license.md'
    ]

    function getLicenseText(depName) {
      const depPath = path.join('node_modules', depName)
      for (const fileName of licenseFilenames) {
        const licensePath = path.join(depPath, fileName)
        if (fs.existsSync(licensePath)) {
          return fs.readFileSync(licensePath, 'utf8')
        }
      }
      return null
    }

    for (const depName of Object.keys(dependencies)) {
      const licenseText = getLicenseText(depName)
      licenses.push({
        package: depName,
        license: licenseText || 'License text not found'
      })
    }

    console.log(JSON.stringify(licenses, null, 2))

    return app.getVersion()
  })
}

import express, { Request, Response } from 'express'
import { dialog, app } from 'electron'
import net from 'net'
import { randomUUID } from 'crypto'
import { datalogs, appState } from '../core/app-state/state'
import z from 'zod'
import { createSendWindow } from '../send/sendWindow'
import { DatalogType } from '@shared/datalogTypes'
import { exportPdf } from '../core/export/exportPdf'
import logger from '../core/logger'

// In-memory storage for approved apps (e.g. keyed by api name)
const approvedApps = new Set<string>()

const authSchema = z.object({ appName: z.string().min(1, { message: 'appName is required' }) })
const idSchema = z.object({ id: z.string().min(1, { message: 'id is required' }) })
const sendSchema = z.object({
  emailId: z.string().nonempty().optional(),
  datalogId: z.string().nonempty().or(z.array(z.string()))
})
const pdfSchema = z.object({
  pdfId: z.string().nonempty(),
  datalogId: z.string().nonempty().or(z.array(z.string()))
})

// Finds an available port starting from a given port.
async function findAvailablePort(start: number): Promise<number> {
  let port = start
  while (true) {
    const available = await new Promise<boolean>((resolve) => {
      const tester = net
        .createServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          tester.close()
          resolve(true)
        })
        .listen(port)
    })
    if (available) return port
    port++
  }
}

const getSelectedDatalogs = (
  selection: string | string[]
): DatalogType | DatalogType[] | undefined => {
  if (typeof selection === 'string') {
    return datalogs().get(`${appState.activeProjectPath}/logs/${selection}.datalog`)
  } else if (Array.isArray(selection)) {
    const res = selection.map((id) =>
      datalogs().get(`${appState.activeProjectPath}/logs/${id}.datalog`)
    )
    res.length ? res : undefined
  }
  return undefined
}

// Starts the local server on an available port.
export async function startLocalServer() {
  const startingPort = 5252
  const port = await findAvailablePort(startingPort)
  const api = express()

  api.use(express.json())

  // Middleware for token authentication, excluding the /auth endpoint.
  api.use((req: Request, res: Response, next) => {
    if (req.path === '/auth') {
      return next()
    }
    const token = req.headers['x-api-token'] as string
    if (!token || !approvedApps.has(token)) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    next()
  })

  // Auth endpoint to approve an api and generate a session token
  api.post('/auth', (req: Request, res: Response) => {
    const parseResult = authSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const { appName } = req.body
    if (!appName) {
      return res.status(400).json({ error: 'Missing appName' })
    }
    const approved = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Approve', 'Deny'],
      title: 'New api Connection',
      message: `Allow ${appName} to access the API?`
    })
    if (approved !== 0) {
      return res.status(403).json({ error: 'api not approved' })
    }
    const token = randomUUID()
    approvedApps.add(token)
    res.json({ token })
  })

  // Example endpoints.
  api.get('/ping', (_req: Request, res: Response) =>
    res.status(200).json({ status: 'ok', port, active: true })
  )
  api.get('/version', (_req: Request, res: Response) =>
    res.status(200).json({ version: app.getVersion() })
  )
  api.get('/project', (_req: Request, res: Response) => {
    if (!appState.activeProject) {
      return res.status(404).json({ error: 'No project loaded' })
    }
    const { settings, templatesDir, ...projectData } = appState.activeProject
    return res.status(200).json(projectData)
  })
  api.post('/project', (_req: Request, _res: Response) => {})
  api.get('/projects', (_req: Request, res: Response) =>
    res.json(appState.projectsInRootPath ?? {})
  )
  api.get('/project-settings', (_req: Request, res: Response) => {
    if (!appState.activeProject) {
      return res.status(404).json({ error: 'No project loaded' })
    }
    return res.json(appState.activeProject?.settings?.project ?? {})
  })
  api.patch('/project-settings', (_req: Request, _res: Response) => {})

  api.get('/datalogs', (_req: Request, res: Response) =>
    res.json({ datalogs: [...datalogs().values()] })
  )
  api.post('/datalog', (_req: Request, _res: Response) => {})
  api.get('/datalog/:id', (req: Request<{ id: string }>, res: Response) => {
    const parseResult = idSchema.safeParse(req.params)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const { id } = parseResult.data
    const datalog = datalogs().get(`${appState.activeProjectPath}/logs/${id}.datalog`)
    if (!datalog) {
      return res.status(404).json({ error: 'Requested Datalog not found' })
    }
    return res.status(200).json(datalog)
  })
  api.patch('/datalog/:id', (req: Request, res: Response) => {
    const parseResult = idSchema.safeParse(req.params)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const { id } = parseResult.data
    const datalog = datalogs().get(`${appState.activeProjectPath}/logs/${id}.datalog`)
    console.log(datalog)
  })
  api.get('/email-presets', (_req: Request, res: Response) => {
    const emails = appState.activeProject?.emails
    return res.json(emails ?? {})
  })
  api.get('/pdf-presets', (_req: Request, res: Response) => {
    const pdfs = appState.activeProject?.pdfs
    return res.json(pdfs ?? {})
  })
  api.post('/send-email', (req: Request, res: Response) => {
    const parseResult = sendSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const { emailId, datalogId } = parseResult.data
    const email = appState.activeProject?.emails?.find((email) => email.id === emailId)
    const selection = getSelectedDatalogs(datalogId)
    createSendWindow(email ?? null, selection)
    return res.status(200).json({ success: true })
  })
  api.post('/generate-pdf', (req: Request, res: Response) => {
    const parseResult = pdfSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const { pdfId, datalogId } = parseResult.data
    const pdf = appState.activeProject?.pdfs?.find((pdf) => pdf.id === pdfId)
    if (!pdf) return res.status(404).json('Could not find matching pdf id')
    const selection = getSelectedDatalogs(datalogId)
    if (!selection) return res.status(404).json('Could not find datalogs from IDs')
    exportPdf({ pdf, selection })
    return res.status(200).json({ success: true })
  })

  // Start the server.
  const server = api.listen(port, () => {
    logger.info(`API-Server running at http://localhost:${port}`)
  })

  return server
}

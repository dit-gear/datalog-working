import express, { Request, Response, RequestHandler } from 'express'
import { dialog, app } from 'electron'
import net from 'net'
import { randomUUID } from 'crypto'
import { datalogs, appState } from '../core/app-state/state'
import z from 'zod'
import { createSendWindow } from '../send/sendWindow'
import { DatalogType, DatalogDynamicZod } from '@shared/datalogTypes'
import { exportPdf } from '../core/export/exportPdf'
import logger from '../core/logger'
import updateDatalog from '../core/datalog/updater'
import deleteDatalog from '../core/datalog/delete'
import { emailType, pdfType, ProjectSchemaZod } from '@shared/projectTypes'
import { createNewProject } from '../core/project/creator'
import { handleChangeProject } from '../core/project/manager'
import { updateProject } from '../core/project/updater'

// In-memory storage for approved apps (e.g. keyed by api name)
const approvedApps = new Set<string>()

// API Version
const API_Ver = '0.1.0'
// Start Port
const startingPort = 5252

const authSchema = z.object({ appName: z.string().min(1, { message: 'appName is required' }) })
const idSchema = z.object({ id: z.string().min(1, { message: 'id is required' }) })
const sendSchema = z.object({
  presetId: z.string().nonempty().optional(),
  datalogId: z.string().nonempty().or(z.array(z.string()))
})
const pdfSchema = z.object({
  presetId: z.string().nonempty(),
  datalogId: z.string().nonempty().or(z.array(z.string()))
})

const loadProjectSchema = z.object({
  path: z.string().min(1, 'Project path is required')
})

// Finds an available port starting from a given port.
async function findAvailablePort(start: number, maxPort = 65535): Promise<number> {
  let port = start
  while (port <= maxPort) {
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
  throw new Error(`No available ports between ${start} and ${maxPort}`)
}

const getSelectedDatalogs = (
  selection: string | string[]
): DatalogType | DatalogType[] | undefined => {
  if (typeof selection === 'string') {
    return datalogs().get(`${appState.activeProjectPath}/logs/${selection}.datalog`)
  } else if (Array.isArray(selection)) {
    const items = selection
      .map((id) => datalogs().get(`${appState.activeProjectPath}/logs/${id}.datalog`))
      .filter((d): d is DatalogType => d !== undefined)
    return items.length === selection.length ? items : undefined
  }
  return undefined
}

const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

// Starts the local server on an available port.
export async function startLocalServer() {
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

  // Authenticate
  api.post('/auth', async (req: Request, res: Response) => {
    const parseResult = authSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const { appName } = req.body
    if (!appName) {
      return res.status(400).json({ error: 'Missing appName' })
    }
    const { response } = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Approve', 'Deny'],
      title: 'New api Connection',
      message: `Allow ${appName} to access the API?`
    })
    if (response !== 0) {
      return res.status(403).json({ error: 'access not approved' })
    }
    const token = randomUUID()
    approvedApps.add(token)
    res.json({ token })
  })

  // Endpoints

  // Ping server
  api.get('/ping', (_req: Request, res: Response) =>
    res.status(200).json({ status: 'ok', port, active: true })
  )

  // Get Version
  api.get('/version', (_req: Request, res: Response) =>
    res.status(200).json({ version: { app: app.getVersion(), api: API_Ver } })
  )

  // Get Project
  api.get('/project', (_req: Request, res: Response) => {
    if (!appState.activeProject) {
      return res.status(404).json({ error: 'No project loaded' })
    }
    const { settings, templatesDir, ...projectData } = appState.activeProject
    return res.status(200).json(projectData)
  })

  // Create Project
  api.post('/project/create', async (req: Request, res: Response) => {
    const parseResult = ProjectSchemaZod.pick({ project_name: true }).safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const result = await createNewProject(parseResult.data.project_name)
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    let project = {}
    if (result.project?.data) {
      const { settings, templatesDir, ...projectData } = result.project.data
      project = projectData
    }
    return res.status(200).json(project)
  })

  // Load Project
  api.post('/project/load', async (req: Request, res: Response) => {
    const parseResult = loadProjectSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }

    const { path } = parseResult.data

    const projectExists = appState.projectsInRootPath?.some((p) => p.path === path)
    if (!projectExists) {
      return res.status(404).json({ error: 'Project path not found' })
    }

    try {
      await handleChangeProject(path)
      return res.status(200).json({ success: true })
    } catch (error) {
      logger.error('Error loading project:', error)
      return res.status(500).json({ error: 'Failed to load project' })
    }
  })

  // List Projects
  api.get('/projects', (_req: Request, res: Response) =>
    res.json(appState.projectsInRootPath ?? [])
  )

  // Get Project Settings
  api.get('/project/config', (_req: Request, res: Response) => {
    if (!appState.activeProject) {
      return res.status(404).json({ error: 'No project loaded' })
    }
    return res.json(appState.activeProject?.settings?.project ?? {})
  })

  // Update Project Settings
  api.patch('/project/config', async (req: Request, res: Response) => {
    const parseResult = ProjectSchemaZod.partial().safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error })
    }
    const project = appState.activeProject
    if (!project) {
      return res.status(404).json({ error: 'No project loaded' })
    }
    const updatedProject = { ...project.settings.project, ...parseResult.data }
    try {
      const result = await updateProject({
        update_settings: { project: updatedProject },
        update_email_api: null
      })
      if (!result.success) {
        return res.status(400).json({ error: result.error })
      }
      return res.status(200).json({ success: true, data: result.project?.data?.settings.project })
    } catch (error) {
      logger.error('Error updating project settings:', error)
      return res.status(500).json({ error: 'Failed to update project settings' })
    }
  })

  // List Datalogs
  api.get('/datalogs', (_req: Request, res: Response) =>
    res.json({ datalogs: [...datalogs().values()] })
  )

  // Create Datalog
  api.post('/datalog', async (req: Request, res: Response) => {
    const project = appState.activeProject
    if (!project) {
      return res.status(404).json({ error: 'No project loaded' })
    }

    const parseResult = DatalogDynamicZod(project).safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }
    const response = await updateDatalog(parseResult.data as DatalogType)
    if (!response.success) {
      if (response.cancelled) {
        return res
          .status(200)
          .json({ success: false, error: 'User canceled the overwrite.', cancelled: true })
      } else {
        return res.status(400).json({ error: response.error })
      }
    }
    res.status(201).json({ success: true })
  })

  // Get Datalog
  api.get('/datalog/:id', (req: Request, res: Response) => {
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

  // Update Datalog
  api.patch('/datalog/:id', async (req: Request, res: Response) => {
    const idParse = idSchema.safeParse({ id: req.params.id })
    if (!idParse.success) {
      return res.status(400).json({ error: idParse.error.errors })
    }
    const id = idParse.data.id

    const project = appState.activeProject
    if (!project) {
      return res.status(404).json({ error: 'No project loaded' })
    }

    const path = `${appState.activeProjectPath}/logs/${id}.datalog`
    const existing = datalogs().get(path)
    if (!existing) {
      return res.status(404).json({ error: 'Datalog not found' })
    }

    const parseResult = DatalogDynamicZod(project).partial().safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors })
    }

    const updatedLog = { ...existing, ...parseResult.data } as DatalogType

    const updateResponse = await updateDatalog(updatedLog, existing)
    if (!updateResponse.success) {
      return res.status(400).json({ error: updateResponse.error })
    }
    return res.status(200).json({ success: true, data: updatedLog })
  })

  // Delete Datalog
  api.delete('/datalog/:id', async (req: Request, res: Response) => {
    const idParse = idSchema.safeParse({ id: req.params.id })
    if (!idParse.success) {
      return res.status(400).json({ error: idParse.error.errors })
    }
    const id = idParse.data.id

    const project = appState.activeProject
    if (!project) {
      return res.status(404).json({ error: 'No project loaded' })
    }

    const path = `${appState.activeProjectPath}/logs/${id}.datalog`
    const datalog = datalogs().get(path)
    if (!datalog) {
      return res.status(404).json({ error: 'Datalog not found' })
    }

    const deletion = await deleteDatalog(datalog)
    if (!deletion.success) {
      return res.status(500).json({ error: deletion.error })
    }
    return res.status(200).json({ success: true })
  })

  // List Email Presets
  api.get('/email-presets', (req: Request, res: Response) => {
    const emails = appState.activeProject?.emails ?? []
    const { enabled } = req.query

    let filteredEmails = emails

    if (enabled === 'true') {
      filteredEmails = emails.filter((email: emailType) => email.enabled)
    } else if (enabled === 'false') {
      filteredEmails = emails.filter((email: emailType) => !email.enabled)
    }

    return res.json(filteredEmails)
  })

  // List PDF Presets
  api.get('/pdf-presets', (req: Request, res: Response) => {
    const pdfs = appState.activeProject?.pdfs ?? []
    const { enabled } = req.query

    let filteredPdfs = pdfs

    if (enabled === 'true') {
      filteredPdfs = pdfs.filter((pdf: pdfType) => pdf.enabled)
    } else if (enabled === 'false') {
      filteredPdfs = pdfs.filter((pdf: pdfType) => !pdf.enabled)
    }

    return res.json(filteredPdfs)
  })

  // Send Email
  api.post(
    '/open-email-window',
    asyncHandler(async (req: Request, res: Response) => {
      const parseResult = sendSchema.safeParse(req.body)
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors })
      }
      const { presetId, datalogId } = parseResult.data
      const email = appState.activeProject?.emails?.find((email) => email.id === presetId)
      const selection = getSelectedDatalogs(datalogId)
      try {
        createSendWindow(email ?? null, selection)
        return res.status(200).json({ success: true })
      } catch (error) {
        logger.error('Error sending email:', error)
        return res.status(500).json({ error: 'Failed to open send window' })
      }
    })
  )

  // Generate PDF
  api.post(
    '/generate-pdf',
    asyncHandler(async (req: Request, res: Response) => {
      const parseResult = pdfSchema.safeParse(req.body)
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.errors })
      }
      const { presetId, datalogId } = parseResult.data
      const pdf = appState.activeProject?.pdfs?.find((pdf) => pdf.id === presetId)
      if (!pdf) {
        return res.status(404).json({ error: 'Could not find matching pdf id' })
      }
      const selection = getSelectedDatalogs(datalogId)
      if (!selection) {
        return res.status(404).json({ error: 'Could not find datalogs from IDs' })
      }
      try {
        const rendered = await exportPdf({ pdf, selection })
        if (!rendered?.success) {
          return res.status(500).json({ error: rendered?.error })
        }
        return res.status(200).json({ success: true, data: rendered.data })
      } catch (error) {
        logger.error('Error generating PDF:', error)
        return res.status(500).json({ error: 'Failed to generate PDF' })
      }
    })
  )

  // Start the server.
  const server = api.listen(port, () => {
    logger.info(`API-Server running at http://localhost:${port}`)
  })

  return server
}

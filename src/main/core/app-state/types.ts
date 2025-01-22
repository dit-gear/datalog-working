import { z } from 'zod'

export const stateZod = z.object({
  rootPath: z.string(),
  activeProject: z.string().nullable()
})

export type state = z.infer<typeof stateZod>

export interface error {
  error: boolean
  message: string
}

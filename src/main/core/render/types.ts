import { DaytalogProps } from 'daytalog'

export type WorkerRequest = {
  path: string
  code: string
  type: 'email' | 'pdf'
  daytalogProps: DaytalogProps
  id: string
}

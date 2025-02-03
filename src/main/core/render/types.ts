import { DataObjectType } from '@shared/shared-types'

export type WorkerRequest = {
  code: string
  type: 'email' | 'pdf'
  message?: string
  dataObject: DataObjectType
  id: string
}

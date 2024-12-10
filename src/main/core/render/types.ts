import { DataObjectType } from '@shared/shared-types'

export type WorkerRequest = {
  code: string
  type: 'email' | 'pdf'
  dataObject: DataObjectType
  id: string
}

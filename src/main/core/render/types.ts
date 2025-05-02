import { DataObjectType } from '@shared/datalogClass'

export type WorkerRequest = {
  path: string
  code: string
  type: 'email' | 'pdf'
  dataObject: DataObjectType
  id: string
}

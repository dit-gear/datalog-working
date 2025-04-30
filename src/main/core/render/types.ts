import { DataObjectType } from '@shared/datalogClass'

export type WorkerRequest = {
  code: string
  type: 'email' | 'pdf'
  dataObject: DataObjectType
  id: string
}

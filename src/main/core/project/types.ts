import { ProjectRootType } from '../../../shared/projectTypes'

export type LoadProjectDataResult = {
  success: boolean
  message?: string
  data?: ProjectRootType
}

import { ProjectType, ProjectRootType } from '../../../shared/projectTypes'
export type CreateNewProjectResult = {
  success: boolean
  message?: string
  project?: ProjectType
}

export type LoadProjectDataResult = {
  success: boolean
  message?: string
  data?: ProjectRootType
}

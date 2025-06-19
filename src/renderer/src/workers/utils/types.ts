import { DaytalogProps } from 'daytalog'

interface BasePreviewUpdate {
  msgtype: 'preview-update'
  id: string
}

export interface PreviewUpdateSuccess extends BasePreviewUpdate {
  success: true
  type: 'email' | 'pdf'
  code: string
}

export interface PreviewUpdateFailure extends BasePreviewUpdate {
  success: false
  error: string
}

export type PreviewUpdate = PreviewUpdateSuccess | PreviewUpdateFailure

export interface ReadBase64 {
  msgtype: 'read-files-base64'
  id: string
  base: string
  paths: string[]
}

export type PreviewWorkerResponse = PreviewUpdate | ReadBase64

export interface PreviewWorkerRequest {
  id: string //should be the file path
  code: string
  type: 'email' | 'pdf'
  daytalogProps: DaytalogProps
}

import z from 'zod'
import { Files } from '@shared/datalogTypes'
export interface Props {
  clips: any[]
}

const FileTypeRequired = Files.required()
export type FileTypeReqType = z.infer<typeof FileTypeRequired>

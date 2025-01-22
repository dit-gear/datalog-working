import path from 'path'
import { appState } from '../app-state/state'
import { DatalogType } from '@shared/datalogTypes'
import { Response } from '@shared/shared-types'
import { moveFileToTrash } from '../../utils/crud'
import Errorhandler from '../../utils/Errorhandler'

const deleteDatalog = async (datalog: DatalogType): Promise<Response> => {
  try {
    const filepath = path.join(appState.activeProjectPath, 'logs', `${datalog.id}.datalog`)
    return moveFileToTrash(filepath)
  } catch (error) {
    return Errorhandler(error)
  }
}

export default deleteDatalog

import logger from '../core/logger'

const Errorhandler = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred.'
  logger.error(`Error loading datalogs: ${message}`)
  return { success: false, error: message }
}

export default Errorhandler

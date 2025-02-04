import { app } from 'electron'
import path from 'path'
import winston from 'winston'
import winstonconfig from './loggerConfig'

// Create log directory if it does not exist
export const logDir = path.join(app.getPath('userData'), 'logs')
const fs = require('fs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

// Configure Winston Logger
const logger = winston.createLogger(winstonconfig(logDir))

// Catch unhandled exceptions and log them
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
})

// Handle unhandled promise rejections and log them
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})
export default logger

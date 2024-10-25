import { app } from 'electron'
import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

// Create log directory if it does not exist
const logDir = path.join(app.getPath('userData'), 'logs')
const fs = require('fs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

// Configure Winston Logger
const logger = winston.createLogger({
  level: 'debug', // Set the default log level
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`
    }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Console transport for real-time logs during development
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }),

    // Daily file rotation for storing log files
    new DailyRotateFile({
      dirname: logDir, // Directory where logs are stored
      filename: 'application-%DATE%.log', // File naming pattern
      datePattern: 'YYYY-MM-DD', // Date pattern for rotation
      maxFiles: '14d', // Keep logs for 14 days
      maxSize: '20m', // Maximum file size before rotation
      level: 'info' // Only log 'info' and above
    })
  ]
})

// Example of using the logger
logger.info('Application started successfully')
logger.error('An error occurred: Something went wrong')

// Catch unhandled exceptions and log them
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
})

// Handle unhandled promise rejections and log them
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})
export default logger

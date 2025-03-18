import { is } from '@electron-toolkit/utils'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const winstonconfig = (logDir: string) => {
  const level = is.dev ? 'debug' : 'info'
  console.log('Winston running on level: ', level)
  return {
    level: level,
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
  }
}
export default winstonconfig

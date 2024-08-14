import fs from 'fs'
import { encryptData, decryptData } from './encryption'

export interface state {
  rootPath: string
  activeProject: string
}
interface error {
  error: boolean
  message: string
}

export async function saveStateToFile(filepath: string, data: state): Promise<error | undefined> {
  try {
    const encryptedData = encryptData(data)
    fs.writeFileSync(filepath, JSON.stringify(encryptedData), 'utf8')
    return
  } catch (error) {
    return { error: true, message: 'Failed to write or encrypt the file' }
  }
}

export async function loadStateFromFile(filepath: string): Promise<state | error> {
  try {
    const fileData = fs.readFileSync(filepath, 'utf8')
    const encryptedObj = JSON.parse(fileData)
    return decryptData(encryptedObj)
  } catch (error) {
    return { error: true, message: 'Failed to read or decrypt the file' }
  }
}

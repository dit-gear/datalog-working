// Encryption and decryption functions
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'
const algorithm = 'aes-256-cbc'
const password = 'password' // Security by obscurity. No sensitive data should be stored here.
const key = scryptSync(password, 'salt', 32)
const iv = randomBytes(16)

export function encryptData(data): { iv: string; encryptedData: string } {
  const cipher = createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { iv: iv.toString('hex'), encryptedData: encrypted }
}

export function decryptData(encryptedObj): any {
  const decipher = createDecipheriv(algorithm, key, Buffer.from(encryptedObj.iv, 'hex'))
  let decrypted = decipher.update(encryptedObj.encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return JSON.parse(decrypted)
}

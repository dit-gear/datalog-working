import { app } from 'electron'
import { exec } from 'child_process'
import util from 'util'
const execPromise = util.promisify(exec)
const SERVICE = 'datalogemail'
const trustedAppPath = app.getPath('exe')

export async function deleteObjectInKeychain(id: string): Promise<void> {
  // Remove existing entry if any (ignore error if not found)
  await execPromise(`security delete-generic-password -a "${id}" -s "${SERVICE}" || true`)
}

export async function writeObjectToKeychain(id: string, obj: string): Promise<void> {
  await deleteObjectInKeychain(id)
  // Add the new (or updated) entry
  await execPromise(
    `security add-generic-password -a "${id}" -s "${SERVICE}" -T "${trustedAppPath}" -w '${obj}'`
  )
}

export async function retrieveObjectFromKeychain(id: string): Promise<string | null> {
  try {
    const { stdout } = await execPromise(
      `security find-generic-password -a "${id}" -s "${SERVICE}" -w`
    )
    return stdout
  } catch {
    return null
  }
}

export async function checkObjectInKeychainExists(id: string): Promise<boolean> {
  try {
    await execPromise(`security find-generic-password -a "${id}" -s "${SERVICE}"`)
    return true
  } catch {
    return false
  }
}

// ipcUtils.ts
import { ipcRenderer } from 'electron'

export async function safeInvoke<T>(channel: string, ...args: any[]): Promise<T> {
  try {
    return await ipcRenderer.invoke(channel, ...args)
  } catch (error) {
    console.error(`IPC Invoke Error on channel "${channel}":`, error)
    throw error
  }
}

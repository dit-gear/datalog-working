import { BrowserWindow } from 'electron'

export function openWindow(window: BrowserWindow): void {
  if (window.isMinimized()) {
    window.restore()
  }
  if (!window.isVisible()) {
    window.show()
  }
  window.focus()
}

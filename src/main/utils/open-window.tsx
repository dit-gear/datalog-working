import { BrowserWindow } from 'electron'

export function openWindow(window: BrowserWindow): void {
  if (window.isMinimized()) {
    window.restore()
  }
  if (!window.isVisible() || !window.isFocused()) {
    window.show()
    window.focus()
  }
  window.focus()
}

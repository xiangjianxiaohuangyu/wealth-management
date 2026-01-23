interface ElectronAPI {
  on: (channel: string, callback: (...args: any[]) => void) => void
  once: (channel: string, callback: (...args: any[]) => void) => void
  removeListener: (channel: string, callback: (...args: any[]) => void) => void
  send: (channel: string, ...args: any[]) => void
  invoke: (channel: string, ...args: any[]) => Promise<any>
  readFile: (filename: string) => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
  }
}

export {}

import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { UpdateManager } from './components/update/UpdateDialog'

function App() {
  const [count, setCount] = useState(0)
  const [appVersion, setAppVersion] = useState('loading...')

  useEffect(() => {
    // 从主进程获取应用版本号
    const getVersion = async () => {
      try {
        const version = await window.electron?.invoke?.('get-app-version')
        setAppVersion(version || 'unknown')
      } catch (error) {
        console.error('Failed to get app version:', error)
        setAppVersion('unknown')
      }
    }
    getVersion()
  }, [])

  return (
    <>
      <UpdateManager />
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + v{appVersion}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 10)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn about the benefits
      </p>
    </>
  )
}

export default App

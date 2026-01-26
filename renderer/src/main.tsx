import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { autoInitialize } from './services/storage/initStorage'

// 初始化默认数据（仅在首次使用时）
autoInitialize()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

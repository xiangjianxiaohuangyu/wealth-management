import { RouterProvider } from './context/RouterContext'
import { AppLayout } from './components/layout'
import { UpdateManager } from './components/update/UpdateDialog'
import './styles/variables.css'

/**
 * 应用主组件
 */
function App() {
  return (
    <>
      <UpdateManager />
      <RouterProvider initialRoute="/dashboard">
        <AppLayout />
      </RouterProvider>
    </>
  )
}

export default App

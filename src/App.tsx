import { FloorCanvas } from './components/FloorCanvas'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Sidebar } from './components/Sidebar'
import { Toolbar } from './components/Toolbar'
import { useCampusStore } from './store/useCampusStore'
import { GoPage } from './pages/GoPage'
import './App.css'

function StudioApp() {
  const store = useCampusStore()

  return (
    <div className="app-shell">
      <Sidebar store={store} />
      <main className="workspace">
        <Toolbar store={store} />
        <FloorCanvas store={store} />
      </main>
      <PropertiesPanel store={store} />
    </div>
  )
}

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path === '/go') {
    return <GoPage />
  }
  return <StudioApp />
}

export default App

import { useState } from 'react'
import type { LoginType } from './components/LoginModal'
import { TimerProvider } from './context/TimerContext'
import { AdminPanel } from './components/AdminPanel'
import LoginModal from './components/LoginModal'
import { DisplayPanel } from './components/DisplayPanel'

function App() {
  const [role, setRole] = useState<LoginType>(null)

  return(
    <TimerProvider>
      {!role && <LoginModal onLogin={setRole} />}
      {role === 'admin' && <AdminPanel onLogout={() => setRole(null)} />}
      {role === 'guest' && <DisplayPanel />}
    </TimerProvider>
  )
}

export default App

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Login from './Login'
import './styles.css'

function Root() {
  const [token, setToken] = useState(() => localStorage.getItem('gestor_projetos_token'))
  return token ? <App /> : <Login onSuccess={setToken} />
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './core/api/axiosConfig' // Import axios config early
import App from './App.jsx'
import './i18n/i18n' // Import i18n configuration

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

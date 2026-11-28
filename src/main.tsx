import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/noto-sans-khmer'
import '@fontsource-variable/noto-sans-sc'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/700.css'
import './i18n'
import './styles/index.css'
import App from './App.tsx'
import { Telemetry } from './components/Telemetry'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Telemetry />
  </StrictMode>,
)

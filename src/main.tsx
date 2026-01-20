import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress ResizeObserver loop limit exceeded error
const resizeObserverLoopErr = /ResizeObserver loop limit exceeded/
const originalError = window.console.error
window.console.error = (msg, ...args) => {
  if (resizeObserverLoopErr.test(msg)) {
    return
  }
  originalError(msg, ...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

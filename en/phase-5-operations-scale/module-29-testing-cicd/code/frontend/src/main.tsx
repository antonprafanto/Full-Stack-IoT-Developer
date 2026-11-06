import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

// Module 24: BrowserRouter reads the address in the browser (for example /devices/f00d00000001) and hands it to <Routes> in App
// Module 24 Practice 5: useTransitions={false} = switching screens must not wait for a button. Without it, a menu switch and a
// button still "Waiting for device confirmation…" (useTransition) are both React transitions that wait for each other, so the
// old screen is held until the device answers (up to ±5 seconds). With false, the new screen shows at once; the command's result still arrives.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter useTransitions={false}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

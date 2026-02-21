import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import './index.css'
import App from './App.tsx'
import { LazyMotion, domAnimation } from 'motion/react'
import { WeekProvider } from './lib/week-context.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation}>
      <WeekProvider>
        <App />
      </WeekProvider>
    </LazyMotion>
  </StrictMode>,
)
